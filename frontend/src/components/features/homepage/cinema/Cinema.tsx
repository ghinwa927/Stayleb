'use client';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { ReactNode } from 'react';
import type { SceneRange, Timeline } from './timeline';

export function Scene({children,id,className='',progress,range,active,animated}:{children:ReactNode;id:string;className?:string;progress:MotionValue<number>;range:SceneRange;active:boolean;animated:boolean}) {
  const opacity=useTransform(progress,range,[0,1,1,0]);
  const x=useTransform(progress,range,['8%','0%','0%','-8%']);
  return <motion.section id={id} className={`film-scene ${className}`} style={animated?{opacity,x,pointerEvents:active?'auto':'none'}:undefined} aria-hidden={animated&&!active?true:undefined} inert={animated&&!active?true:undefined}>{children}</motion.section>;
}
export function Scenery({progress,animated,timeline}:{progress:MotionValue<number>;animated:boolean;timeline:Timeline}) {
  const [mountainStart,mountainEnd]=timeline.mountainTransition;
  const [coastStart,coastEnd]=timeline.coastTransition;
  const mountainScale=useTransform(progress,[0,mountainEnd],[1,1.16]);
  const mountainX=useTransform(progress,[0,mountainEnd],['0%','-4%']);
  const coastOpacity=useTransform(progress,[coastStart,coastEnd],[0,1]);
  const coastScale=useTransform(progress,[coastStart,1],[1.12,1]);
  const coastX=useTransform(progress,[coastStart,1],['4%','0%']);
  const lodgeOpacity=useTransform(progress,[mountainStart,mountainEnd,coastStart,coastEnd],[0,1,1,0]);
  const lodgeScale=useTransform(progress,[mountainStart,coastEnd],[1.12,1.02]);
  const lodgeX=useTransform(progress,[mountainStart,coastEnd],['3%','-2%']);
  return <div className="film-scenery" aria-hidden="true"><motion.div className="film-image mountain-film" style={animated?{scale:mountainScale,x:mountainX}:undefined}/><motion.div className="film-image lodge-film" style={{opacity:animated?lodgeOpacity:0,scale:animated?lodgeScale:1,x:animated?lodgeX:0}}/><motion.div className="film-image coast-film" style={{opacity:animated?coastOpacity:0,scale:animated?coastScale:1,x:animated?coastX:0}}/><div className="film-grade"/><div className="film-vignette"/><div className="film-mist"/><div className="grain"/></div>;
}
