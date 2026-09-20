"use client";
import {createContext,useContext,useState,type ReactNode,type HTMLAttributes} from 'react';
interface WizardState { step:number;go:(n:number)=>void;next:()=>void;back:()=>void;totalSteps:number }
const Context=createContext<WizardState | null>(null);
export function usePropertyWizard(){return useContext(Context);}
export function PropertyWizard({children, totalSteps=7}:{children:ReactNode; totalSteps?:number}){
 const [step,setStep]=useState(1);
 function go(next:number){setStep(Math.min(totalSteps,Math.max(1,next)));if(typeof window!=='undefined') window.scrollTo({top:0,behavior:'smooth'});}
 function next(){
   const inputs=Array.from(document.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>(`#step-panel-${step} input, #step-panel-${step} textarea, #step-panel-${step} select`));
   if(inputs.some(input=>!input.reportValidity() && input.offsetParent!==null)) return;
   go(step+1);
 }
 return <Context.Provider value={{step,go,next,back:()=>go(step-1),totalSteps}}><div className="bg-surface-container-low px-6 py-3 text-xs text-white flex justify-between"><span>New property · Step {step} of {totalSteps}</span><span>{Math.round(step/totalSteps*100)}% complete</span></div>{children}</Context.Provider>;
}
export function WizardStep({number,children,className='',...props}:HTMLAttributes<HTMLDivElement>&{number:number}){const wizard=useContext(Context);return <div {...props} hidden={wizard?.step!==number} className={className.replace(/\bhidden\b/g,'')}>{children}</div>;}
