import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

export default function ImageCropperModal({ imageSrc, onCropComplete, onCancel }: any) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

    const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        if (!croppedAreaPixels) return
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
            onCropComplete(croppedImage)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', flex: 1 }}>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onCropComplete={onCropCompleteHandler}
                    onZoomChange={setZoom}
                />
            </div>
            <div style={{ padding: '20px', background: '#fff', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <span style={{color: '#000', fontWeight: 'bold'}}>Zoom</span>
                <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{ width: '50%' }} />
            </div>
            <div style={{ padding: '20px', background: '#fff', display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                <button type="button" onClick={onCancel} className="btn btn-outline" style={{padding: '10px 20px'}}>Cancel</button>
                <button type="button" onClick={handleSave} className="btn btn-primary" style={{padding: '10px 20px'}}>Save Crop</button>
            </div>
        </div>
    )
}

const createImage = (url: string) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: any
): Promise<File | null> {
  const image: any = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(new File([file as Blob], 'profile.jpg', { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.9)
  })
}
