"use client";

import React from "react";
import { StasAirwayVisual } from "./visuals/StasAirwayVisual";
import { VpiPleuraVisual } from "./visuals/VpiPleuraVisual";
import { LviVesselVisual } from "./visuals/LviVesselVisual";
import { IaslcSubtypeVisual } from "./visuals/IaslcSubtypeVisual";
import { GgoEvolutionSimulator } from "./visuals/GgoEvolutionSimulator";
import { FleischnerDecisionTree } from "./visuals/FleischnerDecisionTree";
import { LobulationVisual } from "./visuals/LobulationVisual";
import { SpiculationVisual } from "./visuals/SpiculationVisual";
import { PleuralIndentationVisual } from "./visuals/PleuralIndentationVisual";
import { VacuoleSignVisual } from "./visuals/VacuoleSignVisual";
import { VascularConvergenceVisual } from "./visuals/VascularConvergenceVisual";
import { IplnLymphVisual } from "./visuals/IplnLymphVisual";
import { IhcKi67Visual } from "./visuals/IhcKi67Visual";
import { CalcificationVisual } from "./visuals/CalcificationVisual";
import { AdjuvantDecisionTreeVisual } from "./visuals/AdjuvantDecisionTreeVisual";
import { MediastinalLNMapVisual } from "./visuals/MediastinalLNMapVisual";
import { EgfrMutationMapVisual } from "./visuals/EgfrMutationMapVisual";
import { PleuralLayersVisual } from "./visuals/PleuralLayersVisual";
import { LungRadsScaleVisual } from "./visuals/LungRadsScaleVisual";
import { PdL1ImmuneMechanismVisual } from "./visuals/PdL1ImmuneMechanismVisual";
import { SurgicalApproachesVisual } from "./visuals/SurgicalApproachesVisual";
import { FollowupTimelineVisual } from "./visuals/FollowupTimelineVisual";
import { MPLCGGOVisual } from "./visuals/MPLCGGOVisual";
import { MrdCtdnaVisual } from "./visuals/MrdCtdnaVisual";
import { Her2AdcVisual } from "./visuals/Her2AdcVisual";
import { EgfrResistanceVisual } from "./visuals/EgfrResistanceVisual";
import { AblationSbrtVisual } from "./visuals/AblationSbrtVisual";
import { TargetedSideEffectsVisual } from "./visuals/TargetedSideEffectsVisual";
import { IldWarningVisual } from "./visuals/IldWarningVisual";
import { IraeImmuneVisual } from "./visuals/IraeImmuneVisual";
import { BoneMarrowGcsfVisual } from "./visuals/BoneMarrowGcsfVisual";
import { BiopsySafetyVisual } from "./visuals/BiopsySafetyVisual";
import { EbusTbnaVisual } from "./visuals/EbusTbnaVisual";
import { TcmBoundaryVisual } from "./visuals/TcmBoundaryVisual";
import { DdiCheckerVisual } from "./visuals/DdiCheckerVisual";

interface WikiVisualRendererProps {
  visualComponent?: string;
}

export function WikiVisualRenderer({ visualComponent }: WikiVisualRendererProps) {
  if (!visualComponent) return null;

  switch (visualComponent) {
    case "GgoEvolutionSimulator":
      return <GgoEvolutionSimulator />;
    case "FleischnerDecisionTree":
      return <FleischnerDecisionTree />;
    case "StasAirwayVisual":
      return <StasAirwayVisual />;
    case "VpiPleuraVisual":
      return <VpiPleuraVisual />;
    case "LviVesselVisual":
      return <LviVesselVisual />;
    case "IaslcSubtypeVisual":
      return <IaslcSubtypeVisual />;
    case "LobulationVisual":
      return <LobulationVisual />;
    case "SpiculationVisual":
      return <SpiculationVisual />;
    case "PleuralIndentationVisual":
      return <PleuralIndentationVisual />;
    case "VacuoleSignVisual":
      return <VacuoleSignVisual />;
    case "VascularConvergenceVisual":
      return <VascularConvergenceVisual />;
    case "IplnLymphVisual":
      return <IplnLymphVisual />;
    case "IhcKi67Visual":
      return <IhcKi67Visual />;
    case "CalcificationVisual":
      return <CalcificationVisual />;
    case "AdjuvantDecisionTreeVisual":
      return <AdjuvantDecisionTreeVisual />;
    case "MediastinalLNMapVisual":
      return <MediastinalLNMapVisual />;
    case "EgfrMutationMapVisual":
      return <EgfrMutationMapVisual />;
    case "PleuralLayersVisual":
      return <PleuralLayersVisual />;
    case "LungRadsScaleVisual":
      return <LungRadsScaleVisual />;
    case "PdL1ImmuneMechanismVisual":
      return <PdL1ImmuneMechanismVisual />;
    case "SurgicalApproachesVisual":
      return <SurgicalApproachesVisual />;
    case "FollowupTimelineVisual":
      return <FollowupTimelineVisual />;
    case "MPLCGGOVisual":
      return <MPLCGGOVisual />;
    case "MrdCtdnaVisual":
      return <MrdCtdnaVisual />;
    case "Her2AdcVisual":
      return <Her2AdcVisual />;
    case "EgfrResistanceVisual":
      return <EgfrResistanceVisual />;
    case "AblationSbrtVisual":
      return <AblationSbrtVisual />;
    case "TargetedSideEffectsVisual":
      return <TargetedSideEffectsVisual />;
    case "IldWarningVisual":
      return <IldWarningVisual />;
    case "IraeImmuneVisual":
      return <IraeImmuneVisual />;
    case "BoneMarrowGcsfVisual":
      return <BoneMarrowGcsfVisual />;
    case "BiopsySafetyVisual":
      return <BiopsySafetyVisual />;
    case "EbusTbnaVisual":
      return <EbusTbnaVisual />;
    case "TcmBoundaryVisual":
      return <TcmBoundaryVisual />;
    case "DdiCheckerVisual":
      return <DdiCheckerVisual />;
    default:
      return null;
  }
}
