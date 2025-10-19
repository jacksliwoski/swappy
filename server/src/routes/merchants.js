import express from 'express';
import { db } from '../db/memory.js';
import { visa } from '../visaClient.js';
import { config } from '../config.js';
export const merchants = express.Router();

merchants.post('/search', async (req,res)=>{
  const { name='', city='', state='', mcc='' } = req.body||{};
  if(config.mock){ return res.json({results:[{merchantId:'mock-001',name:name||'University Book Store',mcc:mcc||'5942',address:{city:city||'Seattle',state:state||'WA',country:'USA'}}],source:'MOCK'}) }
  try{
    const payload={ searchAttrList:{ merchantName:name||undefined, merchantCity:city||undefined, merchantState:state||undefined, merchantCountry:'USA', merchantCategoryCode:mcc||undefined }, searchOptions:{maxRecords:'5',wildCard:'true',matchIndicators:'true',matchScore:'true'}, responseAttrList:['GNSTANDARD'] };
    const {data}=await visa.post('/merchantsearch/v1/search', payload);
    const results=(data.merchantSearchServiceResponse?.response||[]).map(r=>({ merchantId:r.merchantId||r.visaMerchantId||String(r.id||Math.random()), name:r.merchantName||r.name, mcc:r.mcc||r.merchantCategoryCode, address:{city:r.merchantCity||r.city,state:r.merchantState||r.state,country:r.merchantCountry||r.country} }));
    res.json({results, source:'VISA'});
  }catch(err){ res.status(502).json({error:'merchant_search_failed',details:err?.response?.data||err.message}); }
});
merchants.post('/allow',(req,res)=>{
  const m=req.body||{}; if(!m.merchantId) return res.status(400).json({error:'merchantId required'});
  db.allowMerchants.set(m.merchantId,m); res.json({ok:true});
});
merchants.get('/allow',(req,res)=>{ res.json(Array.from(db.allowMerchants.values())); });
