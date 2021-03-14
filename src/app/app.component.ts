import { Component, Inject, OnInit } from '@angular/core';
import { AUDIO_CONTEXT } from '@ng-web-apis/audio';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'web-audio-demo';
  disabled = true;
  oscillator1: any;
  oscillator2: any;
  pitchCtrl = 64;
  shapeCtrl = 0;
  gateCtrl = 64;
  gateWidth = 0.5;
  pitch = 523.25;
  gainOsc1: any;
  gainOsc2: any;
  gainNode: any;
  trigger: any;
  tempoBPM = 120; // set the tempo (in BPM)
  tempoMS = 666.67;
  rootMidiNote = 60; // set root note (midi number)

  constructor(@Inject(AUDIO_CONTEXT) private readonly context: AudioContext) {}

  enable(): any {
    this.disabled = !this.disabled;

    if (this.disabled === false) {
      this.context.resume();
      // this.gainNode.gain.setValueAtTime(0.25, this.context.currentTime);
      this.tempoMS = 60000 / this.tempoBPM; // BPM to ms conversion
      this.trigger = setInterval(() => { this.setPitch(); }, this.tempoMS);
    } else {
      // this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 1);
      clearInterval(this.trigger);
    }
  }

  get text(): string {
    return this.disabled ? 'Start audio' : 'Stop audio';
  }

  pitchChange($event: any): any {
    let value = Math.round($event.value / 12.7);
    switch (value) {
      case 0:
        value = this.rootMidiNote;
        break;
      case 1:
        value = this.rootMidiNote + 2;
        break;
      case 2:
        value = this.rootMidiNote + 4;
        break;
      case 3:
        value = this.rootMidiNote + 7;
        break;
      case 4:
        value = this.rootMidiNote + 9;
        break;
      case 5:
        value = this.rootMidiNote + 12;
        break;
      case 6:
        value = this.rootMidiNote + 14;
        break;
      case 7:
        value = this.rootMidiNote + 16;
        break;
      case 8:
        value = this.rootMidiNote + 19;
        break;
      case 9:
        value = this.rootMidiNote + 21;
        break;
      case 10:
        value = this.rootMidiNote + 24;
        break;
      default:
        value = 5;
        break;
    }
    this.pitch = toFrequency(value);
    // this.oscillator.frequency.setValueAtTime(this.pitch, this.context.currentTime);
    // console.log($event);
    // console.log(this.pitchCtrl);
    // console.log(this.pitch);
  }

  setPitch(): void {
    this.oscillator1.frequency.setValueAtTime(this.pitch, this.context.currentTime);
    this.oscillator2.frequency.setValueAtTime(this.pitch, this.context.currentTime);
    // console.log(this.pitch);
    this.gainNode.gain.exponentialRampToValueAtTime(0.25, this.context.currentTime + this.gateWidth * 0.5 / 1000);
    this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 2 * (this.gateWidth * 0.5 / 1000));
    // console.log(this.gateWidth * 0.5 / 1000);
  }

  gateChange($event: any): any {
    this.gateWidth = ($event.value / 127) * 0.8 * this.tempoMS + 100;
    // console.log(this.gateWidth);
  }

  shapeChange($event: any): any {
    const value = $event.value / 127;
    // console.log(value);
    this.gainOsc1.gain.linearRampToValueAtTime(1 - value, this.context.currentTime + 0.3);
    this.gainOsc2.gain.linearRampToValueAtTime(value, this.context.currentTime + 0.3);
  }

  ngOnInit(): void {
    // initiate building blocks
    this.oscillator1 = this.context.createOscillator();
    this.oscillator2 = this.context.createOscillator();
    this.gainOsc1 = this.context.createGain();
    this.gainOsc2 = this.context.createGain();
    this.gainNode = this.context.createGain();
    // connect all building blocks
    this.oscillator1.connect(this.gainOsc1);
    this.oscillator2.connect(this.gainOsc2);
    this.gainOsc1.connect(this.gainNode);
    this.gainOsc2.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);
    // set (initial) parameters for all blocks
    this.oscillator1.start();
    this.oscillator2.start();
    this.oscillator1.type = 'triangle';
    this.oscillator2.type = 'sawtooth';
    this.gainOsc1.gain.setValueAtTime(1.0, this.context.currentTime);
    this.gainOsc2.gain.setValueAtTime(0.0, this.context.currentTime);
    this.gainNode.gain.setValueAtTime(0.0, this.context.currentTime);
    // this.gateChange(64); // WIP value = 64
  }
}

export function toFrequency(note: number): number {
  return Math.pow(2, (note - 69) / 12) * 440;
}
