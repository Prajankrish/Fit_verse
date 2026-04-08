import React, { createContext, useContext, useState, ReactNode } from "react";
import { api } from "../utils/api";
import { toast } from "sonner";

interface FittingRoomContextProps {
  userImage: string | null;
  setUserImage: (img: string | null) => void;
  bodyMeasurements: any;
  setBodyMeasurements: (m: any) => void;
  bodyType: string;
  setBodyType: (t: string) => void;
  gender: string;
  setGender: (g: string) => void;
  avatar: any;
  setAvatar: (a: any) => void;
  selectedProduct: any;
  setSelectedProduct: (p: any) => void;
  fitResult: any;
  setFitResult: (r: any) => void;
  recommendations: any;
  setRecommendations: (r: any) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
  
  // High-level Actions
  fetchRecommendations: () => Promise<void>;
  predictFit: () => Promise<void>;
  generateAvatar: () => Promise<void>;
}

export const FittingRoomContext = createContext<FittingRoomContextProps>({} as any);

export const FittingRoomProvider = ({ children }: { children: ReactNode }) => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [bodyMeasurements, setBodyMeasurements] = useState<any>({
    height: 170,
    bust: 90,
    waist: 70,
    hips: 95
  });
  const [bodyType, setBodyType] = useState<string>("average");
  const [gender, setGender] = useState<string>("female");
  const [avatar, setAvatar] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [fitResult, setFitResult] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const generateAvatar = async () => {
     if (!bodyMeasurements) return;
     try {
        setLoading(true);
        console.log("[Avatar API] Calling generate-avatar with", bodyMeasurements);
        // Note: Currently calling the existing api (which we added the backend for)
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/api/v1/generate-avatar`, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ measurements: bodyMeasurements })
        });
        if (res.ok) {
           const data = await res.json();
           console.log("[Avatar API] Avatar generated:", data.avatar_parameters);
           setAvatar(data.avatar_parameters);
        } else {
           console.warn("[Avatar API] Endpoint failed, using fallback parametric logic");
           setAvatar({ status: 'fallback', scale: [1,1,1] });
        }
     } catch (err) {
        console.error(err);
        setAvatar({ status: 'fallback', scale: [1,1,1] });
     } finally {
        setLoading(false);
     }
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      console.log("[StyleMe API] Fetching recommendations for", { bodyType, gender });
      const data = await api.recommendStyle({}, bodyType, gender);
      console.log("[StyleMe API] Received Recommendations:", data);
      setRecommendations(data);
      toast.success("AI stylistic catalog generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const predictFit = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product first");
      return;
    }
    if (!bodyMeasurements) {
      toast.error("Please provide body measurements first");
      return;
    }

    try {
      setLoading(true);
      console.log("[FitPrediction API] Connecting measurements & product:", { bodyMeasurements, selectedProduct: selectedProduct.id });
      
      const result = await api.predictFit(
         null, // measurementId not strictly needed if we pass raw measurements mapping
         selectedProduct.id,
         "M", // fallback size 
         {...bodyMeasurements, body_type: bodyType, gender: gender}
      );
      
      console.log("[FitPrediction API] Prediction Result:", result);
      setFitResult(result);
      toast.success("Prediction complete!");
    } catch (err) {
      console.error(err);
      toast.error("Fit prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FittingRoomContext.Provider
      value={{
        userImage, setUserImage,
        bodyMeasurements, setBodyMeasurements,
        bodyType, setBodyType,
        gender, setGender,
        avatar, setAvatar,
        selectedProduct, setSelectedProduct,
        fitResult, setFitResult,
        recommendations, setRecommendations,
        loading, setLoading,
        fetchRecommendations,
        predictFit,
        generateAvatar
      }}
    >
      {children}
    </FittingRoomContext.Provider>
  );
};
export const useFittingRoom = () => useContext(FittingRoomContext);
