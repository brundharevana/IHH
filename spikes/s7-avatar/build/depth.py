import time, numpy as np, onnxruntime as ort, sys
from PIL import Image, ImageFilter
S=sys.argv[1]
so=ort.SessionOptions(); so.graph_optimization_level=ort.GraphOptimizationLevel.ORT_DISABLE_ALL  # fp16 fusion bug in ORT 1.24
s=ort.InferenceSession('da2s_fp16.onnx',so,providers=['CPUExecutionProvider'])
inp=s.get_inputs()[0]; print(inp.name,inp.shape,inp.type,[o.name for o in s.get_outputs()])
im=Image.open(S+'/portrait.webp').convert('RGB'); W,H=im.size
w,h=518,644
x=np.asarray(im.resize((w,h),Image.BICUBIC),np.float32)/255.
x=(x-[0.485,0.456,0.406])/[0.229,0.224,0.225]; x=x.transpose(2,0,1)[None].astype(np.float32 if 'float)' in inp.type and '16' not in inp.type else np.float16)
t=time.time(); d=s.run(None,{inp.name:x})[0]; dt=time.time()-t
d=np.squeeze(d).astype(np.float32); print('shape',d.shape,'infer s',round(dt,2))
d=(d-d.min())/(d.max()-d.min())
img=Image.fromarray((d*255).astype(np.uint8)).resize((W//2,H//2),Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.2))
img.save(S+'/depth.png',optimize=True); img.save(S+'/depth.webp',quality=80)
print('infer_s',dt)
