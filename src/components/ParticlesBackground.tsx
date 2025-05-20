// src/components/ParticlesBackground.tsx
import React, { useCallback } from 'react';
import Particles from 'react-tsparticles';           // ✅ v2 wrapper
import { loadFull } from 'tsparticles';              // ✅ v2 bundle
import type { Engine, Container } from 'tsparticles-engine'; // v3 types
import { appleBlue, appleGray } from '../theme'; // Use theme colors
const ParticlesBackground: React.FC = () => {
    // this initializes the tsparticles engine once per application instance
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadFull(engine);
    }, []);

    // // Not needed for this config, but useful for interactions
    // const particlesLoaded = useCallback(async (container: Container | undefined) => {
    //     // console.log(container);
    // }, []);

    // Configuration inspired by https://particles.js.org/samples/sections/backgroundMask.html
    // and adjusted for a flowing, colorful look
    const options = {
        // background: { // Background set by theme/CssBaseline
        //     color: {
        //         value: appleGray[800], // Match theme background
        //     },
        // },
        fullScreen: {
             enable: true,
             zIndex: -1 // Place behind everything else
        },
        fpsLimit: 120, // Limit FPS for performance
        interactivity: {
            events: {
                onHover: {
                    enable: false, // Disable hover effects for performance
                    mode: "repulse",
                },
                onClick: {
                    enable: false, // Disable click effects
                    mode: "push",
                },
                resize: true,
            },
            modes: {
                push: {
                    quantity: 4,
                },
                repulse: {
                    distance: 150,
                    duration: 0.4,
                },
            },
        },
        particles: {
            color: { // Use multiple colors
                value: [ "#FF5E5B", "#FFB01F", "#FFDA5B", "#D9E76C", "#A7D76C", "#3EDC7E", "#00DFAE", "#00CFAA", appleBlue, "#5856D6", "#C271B4" ],
            },
            links: {
                color: "#ffffff", // Keep links subtle or disable
                distance: 150,
                enable: false, // Disable links for a more fluid look
                opacity: 0.1,
                width: 1,
            },
            collisions: {
                enable: false, // Disable collisions
            },
            move: {
                direction: "none", // Random movement
                enable: true,
                outModes: {
                    default: "out", // Particles disappear when going out
                },
                random: true, // Fully random movement
                speed: 1.5, // Adjust speed
                straight: false, // Wavy movement
                 trail: { // Create trails for a flowing effect
                      enable: true,
                      fillColor: appleGray[800], // Match background
                      length: 20,
                 }
            },
            number: {
                density: {
                    enable: true,
                    area: 1000, // Adjust density
                },
                value: 50, // Number of particles
            },
            opacity: {
                value: { min: 0.3, max: 0.8 }, // Random opacity
                 animation: {
                     enable: true,
                     speed: 0.5,
                     minimumValue: 0.1,
                     sync: false
                 }
            },
            shape: {
                type: "circle", // Simple circle shape
            },
            size: {
                value: { min: 1, max: 4 }, // Random size
                 animation: {
                     enable: true,
                     speed: 2,
                     minimumValue: 0.5,
                     sync: false
                 }
            },
        },
        detectRetina: true,
    };


    // Cast options to the correct type if necessary, often inferred
    // (import type { ISourceOptions } from "tsparticles-engine";)
    // const typedOptions: ISourceOptions = options;

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            // loaded={particlesLoaded} // Uncomment if needed
            options={options as any} // Cast to any if type inference struggles
        />
    );
};

export default ParticlesBackground;