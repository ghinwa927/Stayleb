"use client";
import {createContext,useContext,useState,type ReactNode,type HTMLAttributes} from 'react';
interface RecordState {status:string;setStatus:(value:string)=>void;remove:()=>void;name:string;setName:(value:string)=>void}
const Context=createContext<RecordState|null>(null);
export function useRecord(){return useContext(Context);}
export function RecordRow({children,initialStatus='',...props}:HTMLAttributes<HTMLTableRowElement>&{initialStatus?:string}){const [status,setStatus]=useState(initialStatus);const [deleted,setDeleted]=useState(false);const [name,setName]=useState('');if(deleted)return null;return <Context.Provider value={{status,setStatus,remove:()=>setDeleted(true),name,setName}}><tr {...props}>{children}</tr></Context.Provider>;}
export function RecordStatus({initial,children,...props}:HTMLAttributes<HTMLSpanElement>&{initial:string}){const record=useRecord();return <span {...props}>{record?.status || initial || children}</span>;}
export function RecordName({initial,...props}:HTMLAttributes<HTMLSpanElement>&{initial:string}){const record=useRecord();return <span {...props}>{record?.name || initial}</span>;}
