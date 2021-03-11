import { Component, Inject, OnInit } from '@angular/core';
import { AUDIO_CONTEXT } from '@ng-web-apis/audio';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'web-audio-demo';
  disabled: boolean = true;
  oscillator: any;
  pitchCtrl: number = 32;
  pitch: number = 440;
  gainNode: any;

  constructor(@Inject(AUDIO_CONTEXT) private readonly context: AudioContext) {}

  enable() {
    this.disabled = !this.disabled;

    if (this.disabled === false) {
      this.context.resume();
      this.gainNode.gain.setValueAtTime(0.25, this.context.currentTime);
    } else {
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 1);
    }
  }

  get text(): string {
    return this.disabled ? 'Start audio' : 'Stop audio';
  }

  pitchChange($event: any) {
    this.pitchCtrl = $event.value;
    this.pitch = toFrequency(this.pitchCtrl)
    this.oscillator.frequency.setValueAtTime(this.pitch, this.context.currentTime);
    // console.log($event)
    // console.log(this.pitchCtrl)
    // console.log(this.pitch)
  }

  ngOnInit() {
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
