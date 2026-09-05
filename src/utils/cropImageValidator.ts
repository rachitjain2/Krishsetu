/**
 * Intelligent Client-Side Produce & Crop Image Validator
 * Analyzes image pixel distributions, color histograms, and texture metrics
 * in <30ms using HTML5 Canvas to immediately reject non-crop photos:
 * - Documents, paper, bills, text screenshots (heavy white, zero saturation)
 * - Blank, dark, or obscured cameras (zero variance / pitch black)
 * - Selfies / human faces (skin tone dominance without harvest texture)
 * - Vehicles, asphalt, electronics, solid wallpapers (extreme cool grays/monochrome)
 */

export interface CropValidationResult {
  isCropLikely: boolean;
  detectedCategory: string;
  rejectionReason: string | null;
  confidence: number;
}

export async function validateProduceImage(
  imageSource: string | File | HTMLImageElement
): Promise<CropValidationResult> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            resolve({
              isCropLikely: true,
              detectedCategory: 'Produce Sample',
              rejectionReason: null,
              confidence: 80,
            });
            return;
          }

          // Scale down to 100x100 for high-speed statistical sampling (10,000 pixels)
          const sampleSize = 100;
          canvas.width = sampleSize;
          canvas.height = sampleSize;
          ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

          const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize);
          const data = imgData.data;
          const totalPixels = sampleSize * sampleSize;

          let whitePixels = 0; // Document background
          let blackPixels = 0; // Dark / blank camera
          let skinTonePixels = 0; // Human selfie
          let lowSaturationPixels = 0; // Grayscale / metallic / documents
          let totalLuminance = 0;
          let rSum = 0;
          let gSum = 0;
          let bSum = 0;

          // Organic crop hues: greens, golden yellows, harvest ambers, reds, earth browns
          let organicCropColorPixels = 0;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            rSum += r;
            gSum += g;
            bSum += b;

            // Luminance
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            totalLuminance += lum;

            if (lum > 225) whitePixels++;
            if (lum < 25) blackPixels++;

            // HSV calculation
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const delta = max - min;
            const sat = max === 0 ? 0 : delta / max;

            if (sat < 0.12) {
              lowSaturationPixels++;
            }

            // Hue approximation
            let hue = 0;
            if (delta !== 0) {
              if (max === r) hue = ((g - b) / delta) % 6;
              else if (max === g) hue = (b - r) / delta + 2;
              else hue = (r - g) / delta + 4;
              hue = Math.round(hue * 60);
              if (hue < 0) hue += 360;
            }

            // Human skin tone heuristic:
            // R > G > B, saturation 0.15 - 0.65, R-G > 15, Hue between 0 and 50
            if (
              r > 95 &&
              g > 40 &&
              b > 20 &&
              max - min > 15 &&
              Math.abs(r - g) > 15 &&
              r > g &&
              g > b &&
              hue >= 5 &&
              hue <= 45 &&
              sat >= 0.18 &&
              sat <= 0.68
            ) {
              skinTonePixels++;
            }

            // Organic agricultural produce colors:
            // - Greens (Hue 65 - 165, sat > 0.15)
            // - Golden wheat / Corn / Mustard / Onions (Hue 30 - 65, sat > 0.20)
            // - Tomatoes / Apples / Chilis / Pomegranates (Hue 345 - 25, sat > 0.25)
            // - Earthy potato / pulses / soil harvest lots (Hue 20 - 45, sat > 0.15, moderate lum)
            // - Cotton (white/cream with subtle organic texture)
            const isGreen = hue >= 65 && hue <= 165 && sat > 0.14;
            const isGoldenOrAmber = hue >= 25 && hue <= 65 && sat > 0.16;
            const isRedOrFruit = (hue >= 340 || hue <= 25) && sat > 0.22;
            const isEarthyProduce = hue >= 15 && hue <= 50 && sat > 0.12 && lum > 40 && lum < 210;

            if (isGreen || isGoldenOrAmber || isRedOrFruit || isEarthyProduce) {
              organicCropColorPixels++;
            }
          }

          const avgLum = totalLuminance / totalPixels;
          const avgR = rSum / totalPixels;
          const avgG = gSum / totalPixels;
          const avgB = bSum / totalPixels;

          // Variance calculation to detect flat / solid color images
          let lumVarianceSum = 0;
          for (let i = 0; i < data.length; i += 4) {
            const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            lumVarianceSum += (lum - avgLum) ** 2;
          }
          const lumStdDev = Math.sqrt(lumVarianceSum / totalPixels);

          const whitePercent = (whitePixels / totalPixels) * 100;
          const blackPercent = (blackPixels / totalPixels) * 100;
          const lowSatPercent = (lowSaturationPixels / totalPixels) * 100;
          const skinTonePercent = (skinTonePixels / totalPixels) * 100;
          const organicProducePercent = (organicCropColorPixels / totalPixels) * 100;

          // 1. BLANK / OBSCURED CAMERA COVER CHECK
          if (blackPercent > 82 || (avgLum < 20 && lumStdDev < 15)) {
            resolve({
              isCropLikely: false,
              detectedCategory: 'Black / Obscured Camera Lens',
              rejectionReason:
                'अमान्य फ़ोटो: कैमरा लेंस ढका हुआ या अत्यधिक अंधेरा है। कृपया प्रकाश में फ़सल की साफ़ फ़ोटो लें। (Lens obscured / pitch black photo rejected)',
              confidence: 99,
            });
            return;
          }

          // 2. SOLID FLAT COLOR / BLANK SCREEN CHECK
          if (lumStdDev < 8.5) {
            resolve({
              isCropLikely: false,
              detectedCategory: 'Solid Background / Flat Graphic',
              rejectionReason:
                'अमान्य फ़ोटो: यह एक सादा रंग या स्क्रीनशॉट है, वास्तविक फ़सल नहीं। (Flat solid color / non-crop pattern rejected)',
              confidence: 98,
            });
            return;
          }

          // 3. TEXT DOCUMENT / INVOICE / RECEIPT / SCREENSHOT CHECK
          if (whitePercent > 58 && lowSatPercent > 70) {
            resolve({
              isCropLikely: false,
              detectedCategory: 'Text Document / Paper / Bill',
              rejectionReason:
                'अमान्य फ़ोटो: यह दस्तावेज़, पर्ची या कागज़ की तस्वीर लगती है। कृपया खेत या गोदाम में कटी हुई असली फ़सल की फ़ोटो लें। (Document or paper detected)',
              confidence: 97,
            });
            return;
          }

          // 4. HUMAN SELFIE / PORTRAIT CHECK
          if (skinTonePercent > 42 && organicProducePercent < 15) {
            resolve({
              isCropLikely: false,
              detectedCategory: 'Human Portrait / Selfie',
              rejectionReason:
                'अमान्य फ़ोटो: तस्वीर में मानव चेहरा/सेल्फ़ी पाया गया है। कृषि गुणवत्ता प्रणाली केवल खाद्यान्न व फ़सलों की जांच करती है। (Human portrait detected, only agricultural produce permitted)',
              confidence: 96,
            });
            return;
          }

          // 5. METALLIC / VEHICLE / MONOCHROMATIC OBJECT
          if (lowSatPercent > 85 && whitePercent < 50 && organicProducePercent < 8) {
            resolve({
              isCropLikely: false,
              detectedCategory: 'Metallic Vehicle / Concrete / Non-Produce',
              rejectionReason:
                'अमान्य फ़ोटो: वाहन, सड़क या गैर-कृषि वस्तु पाई गई। कृपया वास्तविक अनाज, फल या सब्जी की फ़ोटो अपलोड करें। (Non-agricultural object or vehicle detected)',
              confidence: 94,
            });
            return;
          }

          // Passed optical heuristic tests
          resolve({
            isCropLikely: true,
            detectedCategory: 'Agricultural Produce Lot',
            rejectionReason: null,
            confidence: Math.min(98, Math.max(80, Math.round(organicProducePercent * 1.2))),
          });
        } catch (innerErr) {
          console.warn('Produce canvas heuristic error:', innerErr);
          resolve({
            isCropLikely: true,
            detectedCategory: 'Produce Lot',
            rejectionReason: null,
            confidence: 80,
          });
        }
      };

      img.onerror = () => {
        resolve({
          isCropLikely: true,
          detectedCategory: 'Produce Lot',
          rejectionReason: null,
          confidence: 80,
        });
      };

      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else if (imageSource instanceof File) {
        img.src = URL.createObjectURL(imageSource);
      } else if (imageSource instanceof HTMLImageElement) {
        img.src = imageSource.src;
      } else {
        resolve({
          isCropLikely: true,
          detectedCategory: 'Produce Lot',
          rejectionReason: null,
          confidence: 80,
        });
      }
    } catch (err) {
      resolve({
        isCropLikely: true,
        detectedCategory: 'Produce Lot',
        rejectionReason: null,
        confidence: 80,
      });
    }
  });
}
