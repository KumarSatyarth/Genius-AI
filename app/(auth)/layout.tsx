"use client"
import { useState } from "react";

const Authlayout = ({
    children
}: {
    children: React.ReactNode;

}) => {
    const [email, setemail] = useState('');
    return (
            <div className="flex items-center justify-center h-full">
                {children}
            </div>
    );
}


export default Authlayout;