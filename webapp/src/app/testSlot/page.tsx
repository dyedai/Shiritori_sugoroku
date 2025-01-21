"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NUMBERS = [2, 3, 4, 5, 6, 7, 8];
const ITEM_HEIGHT = 128; // Height of each number container
const SPIN_DURATION = 3000; // 3 seconds

export default function SlotMachine() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const currentPositionRef = useRef(0);

  const updatePosition = (position: number) => {
    if (slotRef.current) {
      // Keep position within bounds of the repeated numbers
      const normalizedPosition = position % (NUMBERS.length * ITEM_HEIGHT);
      slotRef.current.style.transform = `translateY(${-normalizedPosition}px)`;
      currentPositionRef.current = position;
    }
  };

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / SPIN_DURATION, 1);

    if (progress < 1) {
      // Fast spin at the beginning, slow down towards the end
      const speed =
        progress < 0.7
          ? 40 // Fast speed for first 70% of animation
          : 40 * Math.pow((1 - progress) / 0.3, 2); // Gradual slowdown

      const newPosition = currentPositionRef.current + speed;
      updatePosition(newPosition);

      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Animation complete - snap to final position
      const randomIndex = Math.floor(Math.random() * NUMBERS.length);
      const finalPosition = (NUMBERS.length + randomIndex) * ITEM_HEIGHT;
      updatePosition(finalPosition);

      setSpinning(false);
      setResult(NUMBERS[randomIndex]);
    }
  };

  const spin = () => {
    setSpinning(true);
    setResult(null);
    startTimeRef.current = undefined;

    // Reset any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Start the animation
    animationRef.current = requestAnimationFrame(animate);
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Initialize position
  useEffect(() => {
    updatePosition(NUMBERS.length * ITEM_HEIGHT);
  }, []);

  return (
    <Card className="w-64 mx-auto">
      <CardContent className="p-6">
        <div className="relative h-32 overflow-hidden mb-4 border-2 border-primary rounded-lg bg-background">
          {/* Overlay gradients for fade effect */}
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-background to-transparent z-10"></div>
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent z-10"></div>

          <div
            ref={slotRef}
            className="absolute left-0 right-0 transition-[filter] duration-200"
            style={{
              filter: spinning ? "blur(1px)" : "none",
            }}
          >
            {[...NUMBERS, ...NUMBERS, ...NUMBERS].map((number, index) => (
              <div
                key={index}
                className="flex items-center justify-center h-32 text-4xl font-bold"
                style={{
                  textShadow: spinning ? "0 0 5px rgba(0,0,0,0.3)" : "none",
                }}
              >
                {number}
              </div>
            ))}
          </div>
        </div>
        <Button onClick={spin} disabled={spinning} className="w-full" variant="default">
          {spinning ? "スピン中..." : "スピン"}
        </Button>
        {result !== null && <p className="mt-4 text-center text-xl font-bold animate-fadeIn">結果: {result}</p>}
      </CardContent>
    </Card>
  );
}
