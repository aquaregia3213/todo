import dotenv from 'dotenv'
import { supabaseStore } from '../src/config/supabaseStore.js'

dotenv.config()

async function testDatabase() {
  const dummyUserId = 'test_agent_user_' + Math.random().toString(36).slice(2, 7)
  console.log(`🤖 Starting CRUD test on Supabase for dummy user: ${dummyUserId}`)

  try {
    // 1. Test getProfile (should trigger seed of default profile)
    console.log('\nStep 1: Testing getProfile seed...')
    const initialProfile = await supabaseStore.getProfile(dummyUserId)
    console.log('✓ Seeding complete. Initial Profile Name:', initialProfile.name)

    // 2. Test saveProfile
    console.log('\nStep 2: Testing saveProfile update...')
    const updatedProfile = {
      ...initialProfile,
      name: 'Agent Test User',
      goal: 'Integrate full-stack auth',
      weeklyTime: '20 hours'
    }
    const savedProfile = await supabaseStore.saveProfile(dummyUserId, updatedProfile)
    console.log('✓ Save complete. Saved Profile Name:', savedProfile.name)
    if (savedProfile.goal !== 'Integrate full-stack auth') {
      throw new Error('Profile update mismatch!')
    }

    // 3. Test saveRoadmap & getRoadmap
    console.log('\nStep 3: Testing roadmap generation storage...')
    const roadmapData = {
      plan30: { skills: ['JavaScript', 'Supabase'], resources: ['docs.supabase.com'], projects: ['Chatbot Auth'] },
      plan90: { skills: ['React Router', 'Express endpoints'], resources: [], projects: [] },
      plan180: { skills: ['Complete deployment'], resources: [], projects: [] }
    }
    const savedRoadmap = await supabaseStore.saveRoadmap(dummyUserId, roadmapData)
    console.log('✓ Roadmap save complete.')

    const fetchedRoadmap = await supabaseStore.getRoadmap(dummyUserId)
    console.log('✓ Roadmap fetch complete. 30 Day skills:', fetchedRoadmap.plan30.skills.join(', '))

    // 4. Test tasks storage
    console.log('\nStep 4: Testing tasks storage...')
    const date = new Date().toISOString().split('T')[0]
    const dummyTasks = [
      { id: 't1', type: 'Learn', title: 'Supabase Auth guides', detail: 'Read RLS configs', duration: '30 min', done: false },
      { id: 't2', type: 'Practice', title: 'Verify database writes', detail: 'Run testing script', duration: '15 min', done: false }
    ]
    const savedTasks = await supabaseStore.saveTasks(dummyUserId, date, dummyTasks)
    console.log(`✓ Saved ${savedTasks.length} tasks successfully.`)

    // 5. Test toggle task & progress logging
    console.log('\nStep 5: Testing task toggling and progress logs...')
    const toggled = await supabaseStore.toggleTask(dummyUserId, 't1')
    console.log('✓ Task t1 toggled to done:', toggled.done)

    const logs = await supabaseStore.getProgressLogs(dummyUserId)
    console.log(`✓ Fetched logs. Total logs: ${logs.length}. Completion for today: ${logs[0]?.completedTasksCount}/${logs[0]?.totalTasksCount}`)

    console.log('\n🎉 ALL DATABASE CRUD OPERATIONS PASSED SUCCESSFULLY ON SUPABASE!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Database CRUD test failed!')
    console.error(error)
    process.exit(1)
  }
}

testDatabase()
