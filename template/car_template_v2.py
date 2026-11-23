# TEMPLATE V2 (tema gelap, gaya referensi Klipdong/Oneline). 1080x1080. Logo pemilik: taruh file logo.png (PNG transparan) di folder template/, otomatis dipakai di pojok kanan bawah.
from PIL import Image, ImageDraw, ImageFont
import os
W=H=1080
AN='/usr/share/fonts/truetype/google-fonts/ofl/anton/Anton-Regular.ttf'
PB='/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf'
PM='/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf'
PR='/usr/share/fonts/truetype/google-fonts/Poppins-Regular.ttf'
BG=(10,12,18); WHITE=(244,241,234); ACC=(255,184,64); MUT=(200,205,215); CARD=(24,28,38); LN=(70,76,92); GRN=(60,200,130); INKD=(12,12,16)
F=lambda p,s:ImageFont.truetype(p,s)
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
    d=ImageDraw.Draw(im)
    if os.path.exists(LOGO):
        lg=Image.open(LOGO).convert('RGBA');lg.thumbnail((2*r,2*r));im.paste(lg,(cx-lg.width//2,cy-lg.height//2),lg)
    else:
        d.ellipse([cx-r,cy-r,cx+r,cy+r],outline=INKD if onacc else ACC,width=5);d.text((cx,cy),"LOGO",font=F(PB,30),fill=INKD if onacc else ACC,anchor='mm')
def identity(d,im,x,y0,dark=False,pitch=42):
    # y0 = titik tengah baris pertama; ikon dan teks disejajarkan di tengah baris
    col=INKD if dark else WHITE;S=28
    for k,(ic,txt) in enumerate(IDENT):
        cy=y0+k*pitch
        pth=ICONDIR+ic+'.png'
        if os.path.exists(pth):
            g=Image.open(pth).convert('RGBA');g.thumbnail((S,S));im.paste(g,(x+(S-g.width)//2,cy-g.height//2),g)
            if ic=='th' and not dark:d.rounded_rectangle([x-1,cy-S//2-1,x+S,cy+S//2],radius=8,outline=(120,126,140),width=2)
        else:
            d.rounded_rectangle([x,cy-S//2,x+S,cy+S//2],radius=7,outline=col,width=2);d.text((x+S//2,cy),{'ig':'IG','fb':'FB','th':'TH'}[ic],font=F(PB,14),fill=col,anchor='mm')
        d.text((x+S+14,cy),txt,font=F(PB,24),fill=col,anchor='lm')
def frame(i,n,src=None,panel=False):
    im=Image.new('RGB',(W,H),BG);d=ImageDraw.Draw(im)
    for x in range(0,W,110):d.line([x,0,x,H],fill=(15,17,24),width=2)
    d.text((80,105),f"{i:02d}",font=F(AN,64),fill=ACC,anchor='ls');d.text((80+d.textlength(f"{i:02d}",font=F(AN,64))+8,105),f"/{n:02d}",font=F(PB,28),fill=MUT,anchor='ls')
    d.rectangle([W-80-(d.textlength("YG LAGITREND",font=F(PB,28))+34),70,W-80-(d.textlength("YG LAGITREND",font=F(PB,28))+34)+18,88],fill=ACC)
    d.text((W-80,105),"YG LAGITREND",font=F(PB,28),fill=WHITE,anchor='rs')
    d.line([80,130,W-80,130],fill=LN,width=3)
    if not panel:
        if src:d.text((80,884),src,font=F(PR,28),fill=MUT,anchor='ls')
        identity(d,im,80,948,False,36);logo(im,925,960,95)
    return im,d
def hook(i,n,title,hl,body):
    im,d=frame(i,n,panel=True);y=170;tf=F(AN,112)
    for l in wrap(d,title,tf,920):d.text((80,y),l,font=tf,fill=WHITE);y+=122
    y+=26
    hw=d.textlength(hl,font=tf);d.rectangle([72,y+14,72+hw+36,y+150],fill=ACC);d.text((90,y+10),hl,font=tf,fill=INKD)
    d.rectangle([0,650,W,H],fill=ACC);lines(d,80,682,body,F(PB,36),INKD,780,50);identity(d,im,80,935,True,36)
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
    im,d=frame(i,n,src);bf=F(AN,330);d.text((80,530),big,font=bf,fill=ACC,anchor='ls')
    d.text((80,610),cap,font=F(PB,40),fill=WHITE,anchor='ls');d.rectangle([80,650,170,658],fill=ACC)
    lines(d,80,685,body,F(PR,34),WHITE,900,46);return im
def closer(i,n,q,sub,src):
    im,d=frame(i,n,src);y=215;tf=F(AN,110)
    for l in bwrap(d,q,tf,920):d.text((80,y),l,font=tf,fill=WHITE);y+=130
    lines(d,80,y+20,sub,F(PM,36),MUT,620,50);return im
