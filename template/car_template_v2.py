# TEMPLATE V2 (tema gelap, gaya referensi Klipdong/Oneline). 1080x1080. Logo pemilik: taruh file logo.png (PNG transparan) di folder template/, otomatis dipakai di pojok kanan bawah.
from PIL import Image, ImageDraw, ImageFont
import os
W=H=1080
AN='/usr/share/fonts/truetype/google-fonts/ofl/anton/Anton-Regular.ttf'
PB='/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf'
PM='/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf'
PR='/usr/share/fonts/truetype/google-fonts/Poppins-Regular.ttf'
BG=(10,12,18); WHITE=(244,241,234); ACC=(255,184,64); MUT=(200,205,215); CARD=(24,28,38); LN=(70,76,92); GRN=(60,200,130); INKD=(12,12,16)
SC=3  # supersampling: gambar digambar 3x lebih besar lalu dikecilkan, supaya tepi halus (anti-aliasing)
class SF:
    def __init__(self,raw):self.raw=raw
F=lambda p,s:SF(ImageFont.truetype(p,int(s*SC)))
def _f(v):
    out=[]
    for a in (v if isinstance(v,(list,tuple)) else [v]):
        out.extend(_f(a) if isinstance(a,(list,tuple)) else [a*SC])
    return out
def _pts(v):
    f=_f(v);return [(f[k],f[k+1]) for k in range(0,len(f),2)] if isinstance(v[0],(list,tuple)) else f
class SD:
    def __init__(self,c):self.d=ImageDraw.Draw(c.img)
    def text(self,xy,t,font,fill=None,anchor=None):self.d.text((xy[0]*SC,xy[1]*SC),t,font=font.raw,fill=fill,anchor=anchor)
    def textlength(self,t,font):return self.d.textlength(t,font=font.raw)/SC
    def line(self,xy,fill=None,width=1,joint=None):self.d.line(_pts(xy),fill=fill,width=int(width*SC),joint=joint)
    def rectangle(self,xy,fill=None,outline=None,width=1):self.d.rectangle(_f(xy),fill=fill,outline=outline,width=int(width*SC))
    def rounded_rectangle(self,xy,radius=0,fill=None,outline=None,width=1):self.d.rounded_rectangle(_f(xy),radius=radius*SC,fill=fill,outline=outline,width=int(width*SC))
    def ellipse(self,xy,fill=None,outline=None,width=1):self.d.ellipse(_f(xy),fill=fill,outline=outline,width=int(width*SC))
    def polygon(self,xy,fill=None,outline=None):self.d.polygon(_pts(xy),fill=fill,outline=outline)
    def arc(self,xy,start,end,fill=None,width=1):self.d.arc(_f(xy),start,end,fill=fill,width=int(width*SC))
class Canvas:
    def __init__(self,img):self.img=img
    def paste_big(self,g,xy):self.img.paste(g,(int(xy[0]),int(xy[1])),g)
    def save(self,path):self.img.resize((W,H),Image.LANCZOS).save(path)
IDENT=[('ig','@yg_lagitrend'),('fb','yg lagi trend'),('th','@yg_lagitrend')]  # satu set untuk semua platform
ICONDIR='/home/claude/carousel-yg-lagitrend/template/icons/'
LOGO='/home/claude/carousel-yg-lagitrend/template/logo.png'
KEEP=["Face ID","Touch ID","Apple Account","iOS 17.3","Stolen Device Protection","Find My","Significant Locations","Settings"]
def wrap(d,t,f,w):
    for k in KEEP:t=t.replace(k,k.replace(' ','\x00'))
    out=[];l=''
    for wd in t.split(' '):
        c=(l+' '+wd).strip()
        if d.textlength(c.replace('\x00',' '),font=f)<=w:l=c
        else:out.append(l);l=wd
    out.append(l);return [x.replace('\x00',' ') for x in out]
def bwrap(d,t,f,w):
    base=wrap(d,t,f,w);n=len(base)
    if n<2:return base
    best=base
    for ww in range(int(w),int(w*0.55),-10):
        c=wrap(d,t,f,ww)
        if len(c)==n:best=c
        else:break
    if len(best[-1].split())==1 and len(best)>1:
        for ww in range(int(w),int(w*0.4),-10):
            c=wrap(d,t,f,ww)
            if len(c)==n and len(c[-1].split())>1:best=c;break
    return best
def lines(d,x,y,t,f,fill,w,lh):
    for l in bwrap(d,t,f,w):d.text((x,y),l,font=f,fill=fill);y+=lh
    return y
def logo(im,cx,cy,r=95,onacc=False):
    d=SD(im)
    if os.path.exists(LOGO):
        lg=Image.open(LOGO).convert('RGBA');lg.thumbnail((2*r*SC,2*r*SC),Image.LANCZOS);im.paste_big(lg,(cx*SC-lg.width//2,cy*SC-lg.height//2))
    else:
        d.ellipse([cx-r,cy-r,cx+r,cy+r],outline=INKD if onacc else ACC,width=5);d.text((cx,cy),"LOGO",font=F(PB,30),fill=INKD if onacc else ACC,anchor='mm')
def identity(d,im,x,y0,dark=False,pitch=42):
    # y0 = titik tengah baris pertama; ikon dan teks disejajarkan di tengah baris
    col=INKD if dark else WHITE;S=24
    for k,(ic,txt) in enumerate(IDENT):
        cy=y0+k*pitch
        pth=ICONDIR+ic+'.png'
        if os.path.exists(pth):
            g=Image.open(pth).convert('RGBA');g.thumbnail((S*SC,S*SC),Image.LANCZOS);im.paste_big(g,((x+S/2)*SC-g.width//2,cy*SC-g.height//2))
            if ic=='th' and not dark:d.rounded_rectangle([x-1,cy-S//2-1,x+S,cy+S//2],radius=8,outline=(120,126,140),width=2)
        else:
            d.rounded_rectangle([x,cy-S//2,x+S,cy+S//2],radius=7,outline=col,width=2);d.text((x+S//2,cy),{'ig':'IG','fb':'FB','th':'TH'}[ic],font=F(PB,12),fill=col,anchor='mm')
        d.text((x+S+12,cy),txt,font=F(PB,20),fill=col,anchor='lm')
def frame(i,n,src=None,panel=False):
    im=Canvas(Image.new('RGB',(W*SC,H*SC),BG));d=SD(im)
    for x in range(0,W,110):d.line([x,0,x,H],fill=(15,17,24),width=2)
    d.text((80,105),f"{i:02d}",font=F(AN,64),fill=ACC,anchor='ls');d.text((80+d.textlength(f"{i:02d}",font=F(AN,64))+8,105),f"/{n:02d}",font=F(PB,28),fill=MUT,anchor='ls')
    d.rectangle([W-80-(d.textlength("YG LAGITREND",font=F(PB,28))+34),70,W-80-(d.textlength("YG LAGITREND",font=F(PB,28))+34)+18,88],fill=ACC)
    d.text((W-80,105),"YG LAGITREND",font=F(PB,28),fill=WHITE,anchor='rs')
    d.line([80,130,W-80,130],fill=LN,width=3)
    if not panel:
        if src:d.text((80,884),src,font=F(PR,28),fill=MUT,anchor='ls')
        identity(d,im,80,952,False,32);logo(im,925,960,95)
    return im,d
def hook(i,n,title,hl,body):
    im,d=frame(i,n,panel=True);y=170;tf=F(AN,112)
    for l in wrap(d,title,tf,920):d.text((80,y),l,font=tf,fill=WHITE);y+=122
    y+=26
    hw=d.textlength(hl,font=tf);d.rectangle([72,y+14,72+hw+36,y+150],fill=ACC);d.text((90,y+10),hl,font=tf,fill=INKD)
    d.rectangle([0,650,W,H],fill=ACC);lines(d,80,682,body,F(PB,36),INKD,780,50);identity(d,im,80,940,True,32)
    logo(im,915,870,105,True);return im
def content(i,n,title,intro,items,src,numbered=True):
    im,d=frame(i,n,src);y=175;tf=F(AN,92)
    for l in bwrap(d,title,tf,920):d.text((80,y),l,font=tf,fill=WHITE);y+=108
    y+=22;y=lines(d,80,y,intro,F(PM,34),MUT,920,48)+16
    ch=min(150,int((840-y)/len(items)))-14
    for k,t in enumerate(items):
        yy=y+k*(ch+14);d.rounded_rectangle([80,yy,1000,yy+ch],radius=22,fill=CARD,outline=LN,width=2)
        d.ellipse([105,yy+ch//2-30,165,yy+ch//2+30],fill=ACC if numbered else GRN);d.text((135,yy+ch//2),str(k+1) if numbered else "v",font=F(AN,38) if numbered else F(PB,34),fill=INKD,anchor='mm')
        f=F(PB,34);ls=bwrap(d,t,f,780);ty=yy+(ch-len(ls)*46)//2
        for l in ls:d.text((195,ty),l,font=f,fill=WHITE);ty+=46
    return im
def stat(i,n,big,cap,body,src):
    im,d=frame(i,n,src);bf=F(AN,330);d.text((80,505),big,font=bf,fill=ACC,anchor='ls')
    d.text((80,585),cap,font=F(PB,40),fill=WHITE,anchor='ls');d.rectangle([80,625,170,633],fill=ACC)
    lines(d,80,660,body,F(PR,34),WHITE,900,46);return im
def closer(i,n,q,sub,src):
    im,d=frame(i,n,src);y=215;tf=F(AN,110)
    for l in bwrap(d,q,tf,920):d.text((80,y),l,font=tf,fill=WHITE);y+=130
    lines(d,80,y+20,sub,F(PM,36),MUT,620,50);return im

# ---------- ILUSTRASI (tema gelap) ----------
RED=(240,90,80)
def ic_phone(d,cx,cy,s=1,col=WHITE):
    d.rounded_rectangle([cx-42*s,cy-80*s,cx+42*s,cy+80*s],radius=int(14*s),outline=col,width=max(3,int(6*s)),fill=(18,22,30))
    d.rounded_rectangle([cx-14*s,cy-68*s,cx+14*s,cy-62*s],radius=3,fill=col)
def ic_shield(d,cx,cy,s=1,col=ACC,tick=INKD):
    d.polygon([(cx-30*s,cy-34*s),(cx+30*s,cy-34*s),(cx+30*s,cy+4*s),(cx,cy+40*s),(cx-30*s,cy+4*s)],fill=col)
    d.line([(cx-13*s,cy-2*s),(cx-3*s,cy+11*s),(cx+16*s,cy-14*s)],fill=tick,width=max(3,int(6*s)),joint='curve')
def ic_clock(d,cx,cy,s=1,col=ACC):
    d.ellipse([cx-62*s,cy-62*s,cx+62*s,cy+62*s],outline=col,width=max(4,int(9*s)),fill=(18,22,30))
    d.line([cx,cy,cx,cy-38*s],fill=col,width=max(3,int(8*s)));d.line([cx,cy,cx+28*s,cy+16*s],fill=col,width=max(3,int(8*s)))
def ic_x(d,cx,cy,s=1,col=RED):
    d.ellipse([cx-34*s,cy-34*s,cx+34*s,cy+34*s],fill=col)
    d.line([cx-14*s,cy-14*s,cx+14*s,cy+14*s],fill=WHITE,width=max(4,int(8*s)));d.line([cx-14*s,cy+14*s,cx+14*s,cy-14*s],fill=WHITE,width=max(4,int(8*s)))
def ic_ok(d,cx,cy,s=1,col=GRN):
    d.ellipse([cx-34*s,cy-34*s,cx+34*s,cy+34*s],fill=col)
    d.line([(cx-15*s,cy+1*s),(cx-4*s,cy+13*s),(cx+17*s,cy-13*s)],fill=WHITE,width=max(4,int(8*s)),joint='curve')
def flow(i,n,title,intro,steps,note,src):
    """steps: list of (ikon, label); ikon in 'phone','clock','phone2'"""
    im,d=frame(i,n,src);y=175;tf=F(AN,92)
    for l in bwrap(d,title,tf,920):d.text((80,y),l,font=tf,fill=WHITE);y+=108
    y+=22;y=lines(d,80,y,intro,F(PM,34),MUT,920,48)+24
    k=len(steps);gap=50;cw=(920-gap*(k-1))//k;ch=330
    for j,(ic,lab) in enumerate(steps):
        x=80+j*(cw+gap);d.rounded_rectangle([x,y,x+cw,y+ch],radius=26,fill=CARD,outline=LN,width=2)
        d.ellipse([x+16,y+16,x+62,y+62],fill=ACC);d.text((x+39,y+40),str(j+1),font=F(AN,30),fill=INKD,anchor='mm')
        cx=x+cw//2;cy=y+130
        if ic=='clock':ic_clock(d,cx,cy,1.0)
        else:ic_phone(d,cx,cy,1.0);ic_shield(d,cx,cy+4,1.0)
        f=F(PB,28);ly=y+235
        for l in bwrap(d,lab,f,cw-30)[:3]:d.text((cx,ly),l,font=f,fill=WHITE,anchor='mm');ly+=36
        if j<k-1:
            ax=x+cw+8;ay=y+ch//2-40;d.polygon([(ax,ay-22),(ax+34,ay),(ax,ay+22)],fill=ACC)
    lines(d,80,y+ch+34,note,F(PM,34),MUT,920,48);return im
def compare(i,n,title,left,right,note,src):
    """left/right: (judul, keterangan)"""
    im,d=frame(i,n,src);y=175;tf=F(AN,92)
    for l in bwrap(d,title,tf,920):d.text((80,y),l,font=tf,fill=WHITE);y+=108
    y+=40;cw=440;ch=420
    for j,(t,sub) in enumerate((left,right)):
        x=80+j*(cw+40);good=(j==0)
        d.rounded_rectangle([x,y,x+cw,y+ch],radius=26,fill=CARD,outline=GRN if good else RED,width=4)
        cx=x+cw//2;ic_phone(d,cx,y+130,1.15)
        if good:ic_shield(d,cx,y+135,1.15);ic_ok(d,cx+62,y+60,0.8)
        else:ic_x(d,cx,y+135,1.0)
        f=F(PB,32);ly=y+250
        for l in bwrap(d,t,f,cw-40):d.text((cx,ly),l,font=f,fill=WHITE,anchor='mm');ly+=42
        f2=F(PR,28);ly+=14
        for l in bwrap(d,sub,f2,cw-50):d.text((cx,ly),l,font=f2,fill=MUT,anchor='mm');ly+=38
    lines(d,80,y+ch+30,note,F(PM,34),MUT,920,48);return im
