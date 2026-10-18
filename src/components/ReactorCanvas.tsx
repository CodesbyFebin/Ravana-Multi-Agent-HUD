import React, { useEffect, useRef } from 'react';
import { ReactorScene } from './three/ReactorScene.ts';
import { AgentStatus } from '../lib/types.ts';

interface ReactorCanvasProps {
  status: AgentStatus;
  amplitude: number;
  onSelectAgent?: (index: number) => void;
  className?: string;
}

export const ReactorCanvas: React.FC<ReactorCanvasProps> = ({
  status,
  amplitude,
  onSelectAgent,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ReactorScene | null>(null);

  // Mount scene strictly once
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new ReactorScene({
      container: mountRef.current,
      onSelectAgent: (idx) => onSelectAgent?.(idx),
    });
    sceneRef.current = scene;

    return () => {
      scene.destroy();
      sceneRef.current = null;
    };
  }, []);

  // Update reactive properties without unmounting canvas
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setAgentState(status);
    }
  }, [status]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setVoiceAmplitude(amplitude);
    }
  }, [amplitude]);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 pointer-events-auto overflow-hidden ${className}`}
      data-testid="reactor-3d-canvas"
    />
  );
};
