import React from 'react';
import {Composition, Sequence, AbsoluteFill} from 'remotion';
import {FPS, TIMED, TOTAL} from './script';
import {SCENE_COMPONENTS} from './scenes';
import {SAMPLE_DUR, Sampel} from './sample';

const Video: React.FC = () => (
  <AbsoluteFill style={{background: '#ECEAE0'}}>
    {TIMED.map((s, i) => {
      const C = SCENE_COMPONENTS[i];
      return (
        <Sequence key={s.id} name={s.id} from={s.from} durationInFrames={s.dur} layout="absolute-fill">
          <C s={s} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Suramadu" component={Video} width={1080} height={1920} fps={FPS} durationInFrames={TOTAL} />
    <Composition id="Sampel8" component={Sampel} width={1080} height={1920} fps={FPS} durationInFrames={SAMPLE_DUR} />
  </>
);
