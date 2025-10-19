import express from 'express';
import { db, makeId } from '../db/memory.js';
import { config } from '../config.js';
import { visa } from '../visaClient.js';
export const guardian = express.Router();

guardian.post('/', (req,res)=>{
  const id=makeId('g'); db.guardians.set(id,{id,last4:null,verified:false,createdAt:new Date().toISOString()}); res.json({id});
});
guardian.get('/:id', (req,res)=>{
  const g=db.guardians.get(req.params.id); if(!g) return res.status(404).json({error:'not_found'});
  res.json({id:g.id,last4:g.last4,verified:g.verified,createdAt:g.createdAt});
});
guardian.post('/verify', async (req,res)=>{
  const { guardianId, pan, expMonth, expYear, cvv2, postalCode } = req.body||{};
  if(!guardianId||!pan||!expMonth||!expYear||!cvv2) return res.status(400).json({error:'guardianId, pan, expMonth, expYear, cvv2 required'});
  const g=db.guardians.get(guardianId); if(!g) return res.status(404).json({error:'guardian_not_found'});
  if(config.mock){ g.verified=true; g.last4=String(pan).slice(-4); return res.json({ok:true,mode:'MOCK',last4:g.last4,verified:g.verified}); }
  try{
    const body={ primaryAccountNumber:pan, cardExpiryDate:`${String(expMonth).padStart(2,'0')}${String(expYear).slice(-2)}`, cardCvv2Value:cvv2, address: postalCode?{postalCode}:undefined, verificationType:'ACCOUNT_VERIFICATION' };
    const {data,headers}=await visa.post(config.visaPavPath, body);
    const decision=data?.decision||data?.status||data?.verificationStatus||'UNKNOWN';
    const verified=String(decision).toUpperCase() in {MATCH:1,SUCCESS:1,VERIFIED:1,APPROVED:1};
    g.verified=!!verified; g.last4=String(pan).slice(-4);
    res.json({ok:true,mode:'VISA',last4:g.last4,verified:g.verified,decision,requestId:headers?.['x-correlation-id']||null});
  }catch(err){ res.status(502).json({error:'pav_failed',details: err?.response?.data||err.message}); }
});
