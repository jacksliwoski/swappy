import express from 'express';
import { db, makeId } from '../db/memory.js';
import { validateListingCriteria } from '../middleware/criteria.js';
export const listings = express.Router();

listings.post('/listings',(req,res)=>{
  const { ownerKidId, title, value, merchantId, description='' } = req.body||{};
  if(!ownerKidId||!title||value==null||!merchantId) return res.status(400).json({error:'ownerKidId, title, value, merchantId required'});
  const check=validateListingCriteria({ kidId: ownerKidId, value, merchantId }); if(!check.ok) return res.status(403).json({ error: check.error, cap: check.cap });
  const id=makeId('L'); const row={ id, ownerKidId, title, description, value:Number(value), merchantId, createdAt:new Date().toISOString(), active:true };
  db.listings.set(id,row); res.json(row);
});
listings.post('/offer',(req,res)=>{
  const { fromListingId, toListingId } = req.body||{}; if(!fromListingId||!toListingId) return res.status(400).json({error:'fromListingId and toListingId required'});
  const A=db.listings.get(fromListingId), B=db.listings.get(toListingId); if(!A||!B) return res.status(404).json({error:'listing_not_found'});
  const kidA=db.kids.get(A.ownerKidId), kidB=db.kids.get(B.ownerKidId);
  const gA=db.guardians.get(kidA?.guardianId), gB=db.guardians.get(kidB?.guardianId); if(!(gA?.verified&&gB?.verified)) return res.status(403).json({error:'guardian_not_verified'});
  const id=makeId('O'); const row={id,fromListingId,toListingId,status:'pending',createdAt:new Date().toISOString()}; db.offers.set(id,row); res.json(row);
});
listings.post('/trades/:id/complete',(req,res)=>{
  const { listingA, listingB } = req.body||{}; const A=db.listings.get(listingA), B=db.listings.get(listingB);
  if(!A||!B) return res.status(404).json({error:'listing_not_found'});
  if(!db.allowMerchants.has(A.merchantId)||!db.allowMerchants.has(B.merchantId)) return res.status(403).json({error:'merchant_not_allowlisted'});
  const tradeId=makeId('T'); const row={id:tradeId,listingA,listingB,merchantId:A.merchantId,status:'completed',completedAt:new Date().toISOString()}; db.trades.set(tradeId,row); res.json(row);
});
