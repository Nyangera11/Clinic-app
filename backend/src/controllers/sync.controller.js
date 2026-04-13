import syncService from '../services/sync.service.js';

export async function syncBulkData(req, res, next) {
  try {
    const payload = req.body;
    const result = await syncService.syncBulkData(payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
