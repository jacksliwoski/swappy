// In-memory DB — replace with AWS later
import { nanoid } from 'nanoid';
export const db = {
  guardians: new Map(),   // {id,last4,verified,createdAt}
  kids: new Map(),        // {id,dob,age,guardianId,level,xp,sell_cap,createdAt}
  allowMerchants: new Map(), // merchantId -> merchant obj
  listings: new Map(),
  offers: new Map(),
  trades: new Map(),
};
export const makeId = (p='id') => `${p}_${nanoid(8)}`;
export function ageFromDOB(d){ const dob=new Date(d), n=new Date(); let a=n.getFullYear()-dob.getFullYear(); const m=n.getMonth()-dob.getMonth(); if(m<0||(m===0&&n.getDate()<dob.getDate())) a--; return a; }
export function capForLevel(level){ const l=Math.max(1,Math.min(5,Number(level||1))); return 50*l; }
