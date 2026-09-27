"use client";
import {useState} from 'react';
import {Icon} from './Icon';
export function RatingInput({criterion, value, onChange}:{criterion:string; value?:number; onChange?:(v:number)=>void}){const [internal,setInternal]=useState(0);const rating=value!==undefined?value:internal;const setRating=(v:number)=>{if(onChange) onChange(v); else setInternal(v);};return <div role="group" aria-label={criterion} className="flex gap-1"><input type="hidden" name={`rating-${criterion}`} value={rating}/>{[1,2,3,4,5].map(v=><button key={v} type="button" aria-label={`${criterion}: ${v} star${v>1?'s':''}`} aria-pressed={v<=rating} className={`p-1 transition-colors ${v<=rating?'text-amber-500':'text-slate-300'}`} onClick={()=>setRating(v)}><Icon name="star" className="text-3xl"/></button>)}</div>;}
