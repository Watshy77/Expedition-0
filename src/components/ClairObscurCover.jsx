"use client";

import { useEffect, useRef, useState } from "react";

export default function ClairObscurCover() {
	const canvasRef = useRef(null);
	const audioRef = useRef(null);
	const hasTransitionedRef = useRef(false);
	const triggeredRef = useRef(false);
	const transitioningRef = useRef(false);
	const [isPlaying, setIsPlaying] = useState(false);

	const [background, setBackground] = useState("/background-clean.jpg");
	const [transitioning, setTransitioning] = useState(false);
	const [hasTransitioned, setHasTransitioned] = useState(false);
	const [triggered, setTriggered] = useState(false);

	useEffect(() => {
		hasTransitionedRef.current = hasTransitioned;
	}, [hasTransitioned]);

	useEffect(() => {
		triggeredRef.current = triggered;
	}, [triggered]);

	useEffect(() => {
		transitioningRef.current = transitioning;
	}, [transitioning]);

	useEffect(() => {
		// Initialiser l'audio une seule fois
		if (!audioRef.current) {
			audioRef.current = new Audio("/sound.mp3");
			audioRef.current.loop = true;
		}
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const petals = Array.from({ length: 100 }, () => ({
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height,
			r: Math.random() * 3 + 1,
			speedY: Math.random() * 0.5 + 0.5,
			speedX: Math.random() * 0.4 - 0.2,
		}));

		const fractures = Array.from({ length: 10 }, () => {
			const path = new Path2D();
			const startX = Math.random() * canvas.width;
			const startY = Math.random() * canvas.height * 0.3;
			path.moveTo(startX, startY);
			let y = startY;
			for (let i = 0; i < 10; i++) {
				const dx = (Math.random() - 0.5) * 30;
				const dy = Math.random() * 50 + 20;
				path.lineTo(startX + dx, y + dy);
				y += dy;
			}
			return { path, opacity: Math.random() * 0.15 + 0.05 };
		});

		let transitionAlpha = 0;

		const drawBackground = () => {
			ctx.globalAlpha = 1;
			const img = new Image();
			img.src = background;
			img.onload = () => {
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

				if (transitioningRef.current) {
					transitionAlpha += 0.05;
					ctx.globalAlpha = transitionAlpha;
					const transitionImg = new Image();
					transitionImg.src = "/background-destroy.jpg";
					transitionImg.onload = () => {
						ctx.drawImage(
							transitionImg,
							0,
							0,
							canvas.width,
							canvas.height
						);
						ctx.globalAlpha = 1;
						if (transitionAlpha >= 1) {
							setBackground("/background-destroy.jpg");
							setTransitioning(false);
							setHasTransitioned(true);
							transitionAlpha = 0;
						}
					};
				}
			};

			ctx.globalAlpha = 1;
			ctx.fillStyle = "rgba(0,0,0,0.4)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		};

		const drawFractures = () => {
			if (transitioningRef.current || hasTransitionedRef.current) {
				fractures.forEach((f) => {
					ctx.strokeStyle = `rgba(255,255,255,${f.opacity})`;
					ctx.lineWidth = 1;
					ctx.stroke(f.path);
				});
			}
		};

		const drawPetals = () => {
			if (transitioningRef.current || hasTransitionedRef.current) {
				ctx.fillStyle = "rgba(255, 0, 50, 0.6)";
				petals.forEach((p) => {
					ctx.beginPath();
					ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
					ctx.fill();
				});
			}
		};

		const updatePetals = () => {
			if (transitioningRef.current || hasTransitionedRef.current) {
				petals.forEach((p) => {
					p.y += p.speedY;
					p.x += p.speedX;
					if (p.y > canvas.height || p.x < 0 || p.x > canvas.width) {
						p.y = -10;
						p.x = Math.random() * canvas.width;
					}
				});
			}
		};

		const drawTitle = () => {
			ctx.font = "bold 56px serif";
			ctx.fillStyle = `#f1e7c2`;
			ctx.shadowColor = "transparent";
			ctx.shadowBlur = 0;
			ctx.textAlign = "center";
			ctx.fillText("Clair Obscur", canvas.width / 2, canvas.height * 0.7);

			ctx.font = "36px serif";
			ctx.shadowBlur = 0;
			ctx.shadowColor = "transparent";
			ctx.fillText(
				"Expédition 0 — Les Origines",
				canvas.width / 2,
				canvas.height * 0.7 + 50
			);
		};

		const animate = () => {
			drawBackground();
			drawFractures();
			drawPetals();
			drawTitle();
			updatePetals();
			requestAnimationFrame(animate);
		};

		animate();
	}, [background]);

	const handleAudioToggle = () => {
		if (!audioRef.current) return;
		if (!isPlaying) {
			audioRef.current
				.play()
				.catch((err) => console.warn("Audio play failed:", err));
			setTransitioning(true);
			setTriggered(true);
		} else {
			audioRef.current.pause();
		}
		setIsPlaying(!isPlaying);
	};

	return (
		<div className="relative w-full h-screen">
			<canvas ref={canvasRef} className="w-full h-full block" />
			<div
				id="vinyl"
				onClick={handleAudioToggle}
				className="absolute left-1/2 top-[70%] w-[300px] h-[60px] -translate-x-1/2 -translate-y-1/2 opacity-0 cursor-pointer"
			/>
		</div>
	);
}
