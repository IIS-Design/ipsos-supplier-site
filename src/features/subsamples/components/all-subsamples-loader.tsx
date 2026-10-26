"use client";
import dynamic from "next/dynamic";
import type { Subsample } from "@/types/subsample";
import { SubsampleCardsSkeleton } from "./subsample-cards-skeleton";
const AllSubsamples = dynamic(() => import("./all-subsamples").then(module => module.AllSubsamples), { loading: () => <SubsampleCardsSkeleton /> });
export function AllSubsamplesLoader(props: { projectName: string; subsamples: Subsample[] }) { return <AllSubsamples {...props} />; }
