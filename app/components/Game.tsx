"use client";

import { useEffect, useRef } from "react";
import * as Phaser from "phaser";

const SPEED = 80; // pixels per second

export default function Game() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    class GameScene extends Phaser.Scene {
      private cat!: Phaser.GameObjects.Sprite;
      private keys!: Record<string, Phaser.Input.Keyboard.Key>;
      private keyOrder: string[] = [];
      private currentDir = "walk-left";
      private isMoving = false;

      preload() {
        this.load.image("background", "/sprites/background.png");
        this.load.aseprite("cewpie", "/sprites/cewpie.png", "/sprites/cewpie.json");
      }

      private visibleBottom(): number {
        const { width: gW, height: gH } = this.scale.gameSize;
        const { width: pW, height: pH } = this.scale.parentSize;
        const scale = Math.max(pW / gW, pH / gH);
        const visH = pH / scale;
        return gH / 2 + visH / 2;
      }

      create() {
        this.add.image(0, 0, "background").setOrigin(0, 0);

        this.anims.createFromAseprite("cewpie");

        this.cat = this.add.sprite(
          this.scale.width / 2,
          this.visibleBottom() * 0.75,
          "cewpie"
        );

        this.showStanding("walk-left");

        this.keys = this.input.keyboard!.addKeys("W,A,S,D") as Record<string, Phaser.Input.Keyboard.Key>;

        ["W", "A", "S", "D"].forEach((name) => {
          const key = this.keys[name];
          key.on("down", () => {
            if (!this.keyOrder.includes(name)) this.keyOrder.push(name);
          });
          key.on("up", () => {
            this.keyOrder = this.keyOrder.filter((k) => k !== name);
          });
        });
      }

      private showStanding(animKey: string) {
        const anim = this.anims.get(animKey);
        if (anim?.frames.length) {
          this.cat.anims.stop();
          this.cat.setFrame(anim.frames[0].frame.name);
        }
        this.currentDir = animKey;
      }

      update(_time: number, delta: number) {
        const dt = delta / 1000;
        const activeKey = this.keyOrder[this.keyOrder.length - 1];

        if (!activeKey) {
          if (this.isMoving) {
            this.showStanding(this.currentDir);
            this.isMoving = false;
          }
          return;
        }

        let dx = 0;
        let dy = 0;
        let animKey = this.currentDir;
        let flipX = false;

        switch (activeKey) {
          case "A":
            dx = -SPEED;
            animKey = "walk-left";
            break;
          case "D":
            dx = SPEED;
            animKey = "walk-left";
            flipX = true;
            break;
          case "W":
            dy = -SPEED;
            animKey = "walk-up";
            break;
          case "S":
            dy = SPEED;
            animKey = "walk-down";
            break;
        }

        this.cat.setFlipX(flipX);

        if (this.cat.anims.currentAnim?.key !== animKey || !this.cat.anims.isPlaying) {
          this.cat.play(animKey);
        }

        this.currentDir = animKey;
        this.isMoving = true;
        this.cat.x += dx * dt;
        this.cat.y += dy * dt;
      }
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 320,
      height: 180,
      scene: GameScene,
      parent: containerRef.current ?? undefined,
      backgroundColor: "#000000",
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 320,
        height: 180,
      },
    });

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-screen overflow-hidden" />;
}
