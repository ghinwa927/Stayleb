"use client";
import {useState} from 'react';
import {Icon} from './Icon';
export function RatingInput({criterion}:{criterion:string}){const [rating,setRating]=useState(0);return <div role="group" aria-label={criterion} className="flex gap-1"><input type="hidden" name={`rating-${criterion}`} value={rating}/>{[1,2,3,4,5].map(value=><button key={value} type="button" aria-label={`${criterion}: ${value} star${value>1?'s':''}`} aria-pressed={value<=rating} className={`p-1 transition-colors ${value<=rating?'text-amber-500':'text-slate-300'}`} onClick={()=>setRating(value)}><Icon name="star" className="text-3xl"/></button>)}</div>;}
