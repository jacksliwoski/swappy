import { db } from '../db/memory.js';
export function requireGuardianVerified(guardianId){ const g=db.guardians.get(guardianId); return !!(g&&g.verified); }
export function validateListingCriteria({ kidId, value, merchantId }){
  const kid=db.kids.get(kidId); if(!kid) return {ok:false,error:'kid_not_found'};
  if(kid.age<8) return {ok:false,error:'age_under_8'};
  if(!requireGuardianVerified(kid.guardianId)) return {ok:false,error:'guardian_not_verified'};
  if(Number(value) > (kid.sell_cap||50)) return {ok:false,error:'value_over_cap',cap:kid.sell_cap||50};
  if(!db.allowMerchants.has(merchantId)) return {ok:false,error:'merchant_not_allowlisted'};
  return {ok:true};
}
