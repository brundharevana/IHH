import time, json, wave, pathlib, numpy as np
from phonemizer.backend.espeak.wrapper import EspeakWrapper
EspeakWrapper.data_path=property(lambda self: pathlib.Path('/tmp/esd7'))  # espeak-ng path buffer limit
from kokoro_onnx import Kokoro
k=Kokoro('kokoro-v1.0.int8.onnx','voices-v1.0.bin')
PH=["Some recent work by E. Fermi and L. Szilard,","which has been communicated to me in manuscript,","leads me to expect that the element uranium may be turned into a new and important source of energy","in the immediate future."]
sr=24000; out=[]; cues=[]; t=0.0; T0=time.time(); allph=[]
for i,txt in enumerate(PH):
    ph=k.tokenizer.phonemize(txt,'en-gb').replace('ʃˈɪlɑːd','sˈɪlɑːd')  # Szilard: espeak gives 'sh'; use s
    s,_=k.create(ph,voice='bm_george',speed=0.95,lang='en-gb',is_phonemes=True)
    s=np.asarray(s,dtype=np.float32)
    # trim leading/trailing near-silence
    nz=np.where(np.abs(s)>0.01)[0]; s=s[max(nz[0]-240,0):nz[-1]+480]
    dur=len(s)/sr; cues.append({'start':round(t,3),'end':round(t+dur,3),'text':txt,'ph':ph}); allph.append(ph)
    out.append(s); t+=dur
    gap=0.32 if i<len(PH)-1 else 0.0
    out.append(np.zeros(int(gap*sr),np.float32)); t+=gap
a=np.concatenate(out); synth=time.time()-T0
w=wave.open('einstein.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes((np.clip(a,-1,1)*32767).astype('<i2').tobytes());w.close()
# 50 fps RMS envelope for amplitude-driven animation
hop=sr//50; env=[float(np.sqrt(np.mean(a[i:i+hop]**2))) for i in range(0,len(a),hop)]
m=max(env); env=[round(e/m,3) for e in env]
json.dump({'cues':cues,'synth_s':round(synth,2),'audio_s':round(len(a)/sr,3),'env50':env},open('tts.json','w'))
print('synth',synth,'audio',len(a)/sr); [print(c['start'],c['end'],c['ph']) for c in cues]
