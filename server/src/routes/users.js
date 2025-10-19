import express from 'express';
import { db, makeId, ageFromDOB, capForLevel } from '../db/memory.js';
export const users = express.Router();

users.post('/kid',(req,res)=>{
  const { dob, guardianId } = req.body||{};
  if(!dob||!guardianId) return res.status(400).json({error:'dob and guardianId required'});
  const age=ageFromDOB(dob); if(age<8) return res.status(403).json({error:'age_under_8'});
  if(!db.guardians.get(guardianId)) return res.status(404).json({error:'guardian_not_found'});
  const id=makeId('k'); const level=1; const sell_cap=capForLevel(level);
  db.kids.set(id,{id,dob,age,guardianId,level,xp:0,sell_cap,createdAt:new Date().toISOString()});
  res.json({id,age,guardianId,level,sell_cap});
});
users.get('/kid/:id',(req,res)=>{
  const kid=db.kids.get(req.params.id); if(!kid) return res.status(404).json({error:'not_found'});
  const g=db.guardians.get(kid.guardianId);
  res.json({...kid, guardian: g?{id:g.id,verified:g.verified,last4:g.last4}:null});
});
users.get('/kid/:id/cap',(req,res)=>{
  const kid=db.kids.get(req.params.id); if(!kid) return res.status(404).json({error:'not_found'});
  res.json({kidId:kid.id, level:kid.level, sell_cap:kid.sell_cap});
});
users.post('/kid/:id/levelup',(req,res)=>{
  const kid=db.kids.get(req.params.id); if(!kid) return res.status(404).json({error:'not_found'});
  if(kid.level>=5) return res.status(400).json({error:'max_level', level:kid.level, sell_cap:kid.sell_cap});
  kid.level+=1; kid.sell_cap=capForLevel(kid.level);
  res.json({kidId:kid.id, level:kid.level, sell_cap:kid.sell_cap});
});
