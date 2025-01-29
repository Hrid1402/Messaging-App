import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import '../styles/ImageCropper.css'

function ImageCropper({ yourImage, onCropDone, onCropCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  // Creates a canvas element and draws the cropped image onto it
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.src = url
    })

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return null
    }

    // Set canvas size to match the crop size
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // Draw the cropped image
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

    // Return as blob URL
    return new Promise((resolve) => {
      canvas.toBlob((file) => {
        resolve(URL.createObjectURL(file))
      }, 'image/jpeg')
    })
  }

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const handleCrop = async () => {
    try {
      const croppedImageUrl = await getCroppedImg(yourImage, croppedAreaPixels)
      onCropDone(croppedImageUrl)
    } catch (error) {
      console.error('Error cropping image:', error)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 600, height: 400 }}>
        <Cropper
          image={yourImage}
          crop={crop}
          zoom={zoom}
          aspect={3 / 3}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </div>
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', flexDirection:'column'}}>
        <div className='cropperBTNS'>
        <button onClick={()=>onCropCancel()}>Cancel</button>
        <button onClick={()=>handleCrop()}>Crop Image</button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropper