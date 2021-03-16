import { Component, HostListener, Inject, OnInit } from '@angular/core';
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
  oscillator3: any;
  lfo: any;
  filter: any;
  distortion: any;
  delay: any;
  pitchCtrl = 64;
  velocityCtrl = 64;
  gateCtrl = 64;
  envelopeCtrl = 64;
  osc2Ctrl = 64;
  shapeCtrl = 0;
  lpfCtrl = 64;
  lfoCtrl = 64;
  delCtrl = 0;
  distCtrl = 0;
  gateWidth = 0.5;
  attack = 0.5;
  decay = 0.5;
  pitchMidi = 72;
  velocity = 0.5;
  osc2tune = 0.5;
  hasChange = false;
  gainOsc1: any;
  gainOsc2: any;
  gainOsc3: any;
  gainNode: any;
  gainLfo: any;
  gainDel: any;
  trigger: any;
  sequence = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 8, 6 , 6, 4, 2];
  tempoBPM = 90; // set the tempo (in BPM)
  tempoMS = 333.34;
  rootMidiNote = 60; // set root note (midi number)

  constructor(@Inject(AUDIO_CONTEXT) private readonly context: AudioContext) {}

  enable(): any {
    this.disabled = !this.disabled;

    if (this.disabled === false) {
      this.context.resume();
      // this.gainNode.gain.setValueAtTime(0.25, this.context.currentTime);
      this.tempoMS = 60000 / this.tempoBPM / 4; // BPM to ms conversion
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
    this.hasChange = true;
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
    this.pitchMidi = value;
    // this.oscillator.frequency.setValueAtTime(this.pitch, this.context.currentTime);
    // console.log($event);
    // console.log(this.pitchCtrl);
    // console.log(this.pitch);
  }

  setPitch(): void {
    if (!this.hasChange) { this.pitchMidi = this.sequence[0] + this.rootMidiNote; }
    this.oscillator1.frequency.setValueAtTime(toFrequency(this.pitchMidi), this.context.currentTime);
    this.oscillator2.frequency.setValueAtTime(toFrequency(this.pitchMidi), this.context.currentTime);
    this.oscillator3.frequency.setValueAtTime(toFrequency(this.pitchMidi + this.osc2tune), this.context.currentTime);
    // console.log(this.pitch);
    // console.log(this.osc2tune);
    this.gainNode.gain.exponentialRampToValueAtTime(this.velocity, this.context.currentTime + this.gateWidth * this.attack / 1000);
    this.gainNode.gain.exponentialRampToValueAtTime(0.0001,
      this.context.currentTime + this.gateWidth * this.attack / 1000 + this.gateWidth * this.decay / 1000);
    // console.log(this.gateWidth * 0.5 / 1000);
    this.sequence.push(this.pitchMidi - this.rootMidiNote);
    this.sequence.shift();
    this.hasChange = false;
  }

  velocityChange($event: any): any {
    this.velocity = $event.value / 127 * 0.8 + 0.2;
    // console.log(this.velocity);
  }

  gateChange($event: any): any {
    this.gateWidth = ($event.value / 127) * 0.8 * this.tempoMS + 100;
    // console.log(this.gateWidth);
  }

  envelopeChange($event: any): any {
    this.attack = $event.value / 127 * 0.8 + 0.1;
    this.decay = (1 - ($event.value / 127)) * 0.8 + 0.1;
    // console.log(this.attack);
    // console.log(this.decay);
  }

  osc2Change($event: any): any {
    let value = Math.round($event.value / 25.6);
    switch (value) {
      case 0:
        value = -24;
        break;
      case 1:
        value = -12;
        break;
      case 2:
        value = -5;
        break;
      case 3:
        value = 0.5;
        break;
      case 4:
        value = 7;
        break;
      case 5:
        value = 12;
        break;
      case 6:
        value = 24;
        break;
      default:
        value = 3;
        break;
    }
    this.osc2tune = value;
  }

  shapeChange($event: any): any {
    const value = $event.value / 127;
    // console.log(value);
    this.gainOsc1.gain.linearRampToValueAtTime(1 - value, this.context.currentTime + 0.3);
    this.gainOsc2.gain.linearRampToValueAtTime(value, this.context.currentTime + 0.3);
  }

  lpfChange($event: any): any {
    let value = $event.value / 127;
    value = value * value;
    value = value * -1 + 1;
    // value = 1 - (Math.exp(Math.log(2) * value) - 1);
    // console.log(value);
    const mult = value * 1950 + 500;
    const sum = (value * -1 + 1) * 2450 + 2550;
    const q = value * 4;
    // console.log(value);
    // console.log(mult);
    // console.log(sum);
    this.filter.frequency.setValueAtTime(sum, this.context.currentTime);
    this.gainLfo.gain.setValueAtTime(mult, this.context.currentTime);
    this.filter.Q.setValueAtTime(q, this.context.currentTime);
  }

  lfoChange($event: any): any {
    let value = Math.round($event.value / 127 * 4);
    if ( value === 0) {
      value = 0.5;
    } else {
      value = value;
    }
    // console.log(value);
    const lfoFreq = 1 / (this.tempoMS) * 1000 * value;
    // console.log(this.tempoMS);
    // console.log(lfoFreq);
    this.lfo.frequency.setValueAtTime(lfoFreq, this.context.currentTime);
  }

  delChange($event: any): any {
    let value = Math.round($event.value / 32);
    switch (value) {
      case 0:
        value = 0.1;
        break;
      case 1:
        value = 0.2;
        break;
      case 2:
        value = 0.33;
        break;
      case 3:
        value = 0.5;
        break;
      case 4:
        value = 0.66;
        break;
      default:
        value = 3;
        break;
    }
    value = value * this.tempoMS / 1000;
    // console.log(value);
    this.delay.delayTime.setValueAtTime(value, this.context.currentTime);
    let gainAmt = ($event.value / 127) * -1 + 1;
    gainAmt = gainAmt * 0.5 + 0.25;
    // console.log(gainAmt);
    this.gainDel.gain.setValueAtTime(gainAmt, this.context.currentTime);
  }

  distChange($event: any): any {
    const value = $event.value / 1.27;
    // console.log(value);
    this.distortion.curve = distortionCurve(value);
  }

  @HostListener('document:keydown', ['$event'])
  keyToPitch(event: KeyboardEvent): number {
    let pitchKey = 64;
    let value = event.code;
    switch (value) {
      case 'KeyA':
        pitchKey = 0;
        break;
      case 'KeyS':
        pitchKey = 13;
        break;
      case 'KeyD':
        pitchKey = 25;
        break;
      case 'KeyF':
        pitchKey = 38;
        break;
      case 'KeyG':
        pitchKey = 51;
        break;
      case 'KeyH':
        pitchKey = 64;
        break;
      case 'KeyJ':
        pitchKey = 76;
        break;
      case 'KeyK':
        pitchKey = 89;
        break;
      case 'KeyL':
        pitchKey = 101;
        break;
      case 'Semicolon':
        pitchKey = 114;
        break;
      case 'Quote':
        pitchKey = 127;
        break;
      default:
        value = 'KeyH';
        break;
    }
    // console.log(pitchKey);
    // this.pitchCtrl = pitchKey;
    // this.pitchMidi = pitchKey;
    this.pitchChange({value: pitchKey});
    return pitchKey;
  }

  ngOnInit(): void {
    // initiate building blocks
    this.oscillator1 = this.context.createOscillator();
    this.oscillator2 = this.context.createOscillator();
    this.oscillator3 = this.context.createOscillator();
    this.lfo = this.context.createOscillator();
    this.filter = this.context.createBiquadFilter();
    this.gainOsc1 = this.context.createGain();
    this.gainOsc2 = this.context.createGain();
    this.gainOsc3 = this.context.createGain();
    this.gainNode = this.context.createGain();
    this.gainLfo = this.context.createGain();
    this.gainDel = this.context.createGain();
    this.distortion = this.context.createWaveShaper();
    this.delay = this.context.createDelay(1);
    // connect all building blocks
    this.oscillator1.connect(this.gainOsc1);
    this.oscillator2.connect(this.gainOsc2);
    this.oscillator3.connect(this.gainOsc3);
    this.lfo.connect(this.gainLfo);
    this.gainLfo.connect(this.filter.frequency);
    this.gainOsc1.connect(this.distortion);
    this.gainOsc2.connect(this.distortion);
    this.distortion.connect(this.filter);
    this.gainOsc3.connect(this.filter);
    this.filter.connect(this.gainNode);
    this.gainNode.connect(this.delay);
    this.delay.connect(this.gainDel);
    this.gainNode.connect(this.context.destination);
    this.gainDel.connect(this.delay); // feedback loop
    this.gainDel.connect(this.context.destination);
    // set (initial) parameters for all blocks
    this.oscillator1.start();
    this.oscillator2.start();
    this.oscillator3.start();
    this.lfo.start();
    this.oscillator1.type = 'triangle';
    this.oscillator2.type = 'sawtooth';
    this.lfo.frequency.setValueAtTime(12, this.context.currentTime);
    this.filter.type = 'lowpass';
    this.distortion.oversample = '4x';
    this.distortion.curve = distortionCurve(0);
    this.gainOsc1.gain.setValueAtTime(1.0, this.context.currentTime);
    this.gainOsc2.gain.setValueAtTime(0.0, this.context.currentTime);
    this.gainOsc3.gain.setValueAtTime(0.7, this.context.currentTime);
    this.gainNode.gain.setValueAtTime(0.0, this.context.currentTime);
    this.gainLfo.gain.setValueAtTime(1, this.context.currentTime);
    this.gainDel.gain.setValueAtTime(0.5, this.context.currentTime);
    this.gateChange({value: 64});
  }
}

export function toFrequency(note: number): number {
  return Math.pow(2, (note - 69) / 12) * 440;
}

export function distortionCurve(amount: number): any {
  const k = typeof amount === 'number' ? amount : 50;
  const samples = 256;
  const curve = new Float32Array(samples);
  let i = 0;
  let x;
  for ( ; i < samples; ++i ) {
    x = i * 2 / samples - 1;
    curve[i] = (Math.PI + k) * x / (Math.PI + k * Math.abs(x) );
  }
  return curve;
}

window.addEventListener('keydown', (event: any) => {
  keyToPitch(event);
});

export function keyToPitch(event: any): number {
  let pitchKey = 64;
  let value = event.code;
  switch (value) {
    case 'KeyA':
      pitchKey = 0;
      break;
    case 'KeyS':
      pitchKey = 13;
      break;
    case 'KeyD':
      pitchKey = 25;
      break;
    case 'KeyF':
      pitchKey = 38;
      break;
    case 'KeyG':
      pitchKey = 51;
      break;
    case 'KeyH':
      pitchKey = 64;
      break;
    case 'KeyJ':
      pitchKey = 76;
      break;
    case 'KeyK':
      pitchKey = 89;
      break;
    case 'KeyL':
      pitchKey = 101;
      break;
    case 'Semicolon':
      pitchKey = 114;
      break;
    case 'Quote':
      pitchKey = 127;
      break;
    default:
      value = 'KeyH';
      break;
  }
  // console.log(pitchKey);
  return pitchKey;
}

