"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web"

export const Crispchat = () => {
    useEffect( () => {
        Crisp.configure("2288fbc4-295d-4485-a2d2-9041a2eb27da");
    }, []);

    return null;
}