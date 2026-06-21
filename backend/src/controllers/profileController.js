import { dbStore } from '../config/store.js'

export async function getProfile(req, res, next) {
  try {
    const profile = await dbStore.getProfile(req.userId)
    res.json({ success: true, data: profile })
  } catch (error) {
    next(error)
  }
}

export async function updateProfile(req, res, next) {
  try {
    const profile = await dbStore.saveProfile(req.userId, req.body)
    res.json({ success: true, data: profile })
  } catch (error) {
    next(error)
  }
}
