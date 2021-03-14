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
  oscillator: any;
  pitchCtrl = 32;
  pitch = 440;
  gainNode: any;
  trigger: any;
  tempo = 666.67;
  rootMidiNote = 60;

  constructor(@Inject(AUDIO_CONTEXT) private readonly context: AudioContext) {}

  enable(): any {
    this.disabled = !this.disabled;

    if (this.disabled === false) {
      this.context.resume();
      // this.gainNode.gain.setValueAtTime(0.25, this.context.currentTime);
      this.trigger = setInterval(() => { this.setPitch(); }, this.tempo);
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
    this.oscillator.frequency.setValueAtTime(this.pitch, this.context.currentTime);
    // console.log(this.pitch);
    this.gainNode.gain.linearRampToValueAtTime(0.25, this.context.currentTime + 0.3);
    this.decay();
  }

  decay(): any {
    this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.8);
  }

  ngOnInit(): void {
    this.oscillator = this.context.createOscillator();
    this.gainNode = this.context.createGain();

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);

    this.oscillator.start();
    this.gainNode.gain.setValueAtTime(0.0, this.context.currentTime);
  }

}

export function toFrequency(note: number): number {
  return Math.pow(2, (note - 69) / 12) * 440;
}
