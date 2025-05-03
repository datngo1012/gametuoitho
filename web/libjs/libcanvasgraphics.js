function instrument(nob) {
  const newobj = {};

  for (const kn of Object.keys(nob)) {
    newobj[kn] = async function() {
      console.log('[callet]', kn, arguments);
      return nob[kn].apply(this, arguments);
    };
  }

  return newobj;
}



/*
whoops.. some of these are async
if another thread uses this dummy canvas, bad things might happen

not impossible, since threds might work on different images
lock could wait on a promise
should unlock resolve it in a microtask?
*/
function createReentryWarningWrapper(obj) {
  const functionStates = {};
  const wrappedFunctions = {}; // Store wrapped functions

  for (const prop in obj) {
    if (typeof obj[prop] === 'function') {
      const originalFunction = obj[prop];

      wrappedFunctions[prop] = async function (...args) {
        const functionKey = prop;

        if (functionStates[functionKey] === 'running') {
          console.warn(`Warning: Function "${prop}" reentered.`);
        }

        functionStates[functionKey] = 'running';

        try {
          const result = await originalFunction.apply(this, args);
          functionStates[functionKey] = 'completed';
          return result;
        } catch (error) {
          functionStates[functionKey] = 'completed';
          throw error;
        } finally {
            if(functionStates[functionKey] === 'completed')
            delete functionStates[functionKey];
        }
      };
    }
  }

  return new Proxy(obj, {
    get: function (target, prop, receiver) {
      return wrappedFunctions[prop] || target[prop]; // Return wrapped function or original property
    },
  });
}


function createSerializedWrapper(methodsObject) {
  let currentTask = null;

  const wrapper = {};

  for (const methodName of Object.keys(methodsObject)) {
    if (typeof methodsObject[methodName] !== "function") {
      continue;
    }

    const originalMethod = methodsObject[methodName];

    wrapper[methodName] = async (...args) => {
      while (currentTask) {
        await currentTask;
        // by the time await returns, another function might have already
        // set currentTask again
        // so we need to verify there's no currentTask while we're executing
        // exclusively synchronously

        // however, the order is actually not guaranteed
        // but we don't care about it here
      }

      const task = originalMethod.apply(methodsObject, args);
      currentTask = task.catch(x => true);

      try {
        return await task;
      } finally {
        currentTask = null;
      }
    };
  }

  return wrapper;
}


const ctx = document.createElement('canvas').getContext('2d');
ctx.canvas.width = 10; ctx.canvas.height = 10;
//document.body.appendChild(ctx.canvas);

async function transformBitmapOrCanvas(src, sx, sy, sw, sh, a90, mirror) {
  if (a90 == 0 && !mirror) {
    return await createImageBitmap(src, sx, sy, sw, sh);
  }

  const swap = a90 & 1;

  ctx.canvas.width = swap ? sh : sw;
  ctx.canvas.height = swap ? sw : sh;

  ctx.save();
  if (a90 || mirror) {
    ctx.translate(ctx.canvas.width/2, ctx.canvas.height/2);
    if (mirror) {
      ctx.scale(swap ? 1 : -1, swap ? -1 : 1);
    }
    ctx.rotate(a90 * 90 * Math.PI / 180);
    if (swap) {
      ctx.translate(-ctx.canvas.height/2, -ctx.canvas.width/2);
    } else {
      ctx.translate(-ctx.canvas.width/2, -ctx.canvas.height/2);
    }
  }
  ctx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
  ctx.restore();

  return await createImageBitmap(ctx.canvas);
}

function castToUint8Clamped(int8) {
  return new Uint8ClampedArray(int8.buffer, int8.byteOffset, int8.byteLength);
}

function castToInt8(uint8) {
  return new Int8Array(uint8.buffer, uint8.byteOffset, uint8.byteLength);
}


const CanvasImage = {
  async Java_pl_zb3_freej2me_bridge_graphics_CanvasImage_bitmapFromColor(lib, width, height, r, g, b, a) {
    ctx.canvas.width = width; ctx.canvas.height = height;

    // ctx.clearRect(0, 0, width, height); // width always resets it.. I guess
    ctx.fillStyle = `rgba(${r} ${g} ${b} / ${a/255})`;
    ctx.fillRect(0, 0, width, height);

    return await createImageBitmap(ctx.canvas);
  },
  async Java_pl_zb3_freej2me_bridge_graphics_CanvasImage_bitmapFromBytes(lib, bytes, result) {
    const blob = new Blob([bytes]);

    try {
      const bitmap = await createImageBitmap(blob);
      result[0] = bitmap.width;
      result[1] = bitmap.height;
      return bitmap;
    } catch (e) {
      return null;
    }
  },
  async Java_pl_zb3_freej2me_bridge_graphics_CanvasImage_transformBitmap(lib, bmp, sx, sy, sw, sh, a90, mirror) {
    return await transformBitmapOrCanvas(bmp, sx, sy, sw, sh, a90, mirror);
  },
  async Java_pl_zb3_freej2me_bridge_graphics_CanvasImage_bitmapFromRGBAData(lib, rgba, width, height) {
    ctx.canvas.width = width; ctx.canvas.height = height;

    const imageData = new ImageData(castToUint8Clamped(rgba), width, height);

    ctx.putImageData(imageData, 0, 0);
    return await createImageBitmap(ctx.canvas);
  },
  async Java_pl_zb3_freej2me_bridge_graphics_CanvasImage_getRGBAFromBitmap(lib, bmp, sx, sy, width, height) {
    ctx.canvas.width = width; ctx.canvas.height = height;
    ctx.drawImage(bmp, sx, sy, width, height, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);

    return castToInt8(imageData.data);
  },
  async Java_pl_zb3_freej2me_bridge_graphics_CanvasImage_setRGBAToBitmap(lib, bmp, rgbaData, x, y, width, height) {
    // set is not draw, we clear the region
    // but putImageData doesn't blend
    ctx.canvas.width = bmp.width; ctx.canvas.height = bmp.height;
    ctx.drawImage(bmp, 0, 0);

    const imageData = new ImageData(castToUint8Clamped(rgbaData), width, height);
    ctx.putImageData(imageData, x, y);

    bmp.close();

    return await createImageBitmap(ctx.canvas);
  },
  async Java_pl_zb3_freej2me_bridge_graphics_CanvasImage_closeBitmap(lib, bmp) {
    bmp.close();
  }
};


function roundRectPath(ctx, x, y, width, height, arcWidth, arcHeight) {
  const radiusX = arcWidth / 2;
  const radiusY = arcHeight / 2;

  ctx.beginPath();

  // Top edge
  ctx.moveTo(x + radiusX, y);
  ctx.lineTo(x + width - radiusX, y);

  // Top-right corner
  ctx.ellipse(x + width - radiusX, y + radiusY, radiusX, radiusY, 0, -Math.PI / 2, 0);

  // Right edge
  ctx.lineTo(x + width, y + height - radiusY);

  // Bottom-right corner
  ctx.ellipse(x + width - radiusX, y + height - radiusY, radiusX, radiusY, 0, 0, Math.PI / 2);

  // Bottom edge
  ctx.lineTo(x + radiusX, y + height);

  // Bottom-left corner
  ctx.ellipse(x + radiusX, y + height - radiusY, radiusX, radiusY, 0, Math.PI / 2, Math.PI);

  // Left edge
  ctx.lineTo(x, y + radiusY);

  // Top-left corner
  ctx.ellipse(x + radiusX, y + radiusY, radiusX, radiusY, 0, Math.PI, -Math.PI / 2);

  ctx.closePath();
}

function setColor(ctx, r, g, b, a) {
  ctx.fillStyle = `rgba(${r} ${g} ${b} / ${a/255})`;
  ctx.strokeStyle = `rgba(${r} ${g} ${b} / ${a/255})`;
}

const CanvasGraphics = ({
  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_getRGBAFromCtx(lib, ctx, sx, sy, width, height) {
    const imageData = ctx.getImageData(sx, sy, width, height);

    return castToInt8(imageData.data);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_drawRGBAData(lib, targetCtx, rgba, width, height, x, y, blend) {
    if (blend) {
      // this is not putImageData, we need to blend here
      ctx.canvas.width = width; ctx.canvas.height = height;
      ctx.putImageData(new ImageData(castToUint8Clamped(rgba), width, height), 0, 0);
      targetCtx.drawImage(ctx.canvas, x, y);
    } else {
      targetCtx.putImageData(new ImageData(castToUint8Clamped(rgba), width, height), x, y);
    }
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_bitmapToCanvasCtx(lib, bmp) {
    const newCtx = document.createElement('canvas').getContext('2d');
    newCtx.canvas.width = bmp.width; newCtx.canvas.height = bmp.height;

    newCtx.drawImage(bmp, 0, 0);

    bmp.close();

    return newCtx;
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_getCanvasFromCtx(lib, ctx) {
    return ctx.canvas;
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_createCanvasCtx(lib, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    //document.body.appendChild(canvas);


    const ctx = canvas.getContext('2d');

    // we measure with this baseline
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = "left";

    ctx.save();
    return ctx;
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_setFullState(lib, ctx, fontStr, dotted, r, g, b, a, clipX, clipY, clipWidth, clipHeight, translateX, translateY) {
    ctx.restore();
    ctx.save();

    ctx.font = fontStr;
    if (dotted) {
      ctx.setLineDash([2, 2]);
    }

    setColor(ctx, r, g, b, a);

    if (clipX !== 0 || clipY !== 0 || clipWidth !== ctx.canvas.width || clipHeight !== ctx.canvas.height) {
      ctx.beginPath();
      ctx.rect(clipX, clipY, clipWidth, clipHeight);
      ctx.clip();
    }

    ctx.translate(translateX, translateY);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_setColor(lib, ctx, r, g, b, a) {
    setColor(ctx, r, g, b, a);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_setFont(lib, ctx, fontStr) {
    ctx.font = fontStr;
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_setDotted(lib, ctx, dotted) {
    ctx.setLineDash(dotted ? [2, 2] : []);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_applyTranslate(lib, ctx, x, y) {
    ctx.translate(x, y);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_putRGBAData(lib, ctx, rgbaData, x, y, width, height) {
    const imageData = new ImageData(castToUint8Clamped(rgbaData), width, height);
    ctx.putImageData(imageData, x, y);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_drawArc(lib, ctx, x, y, width, height, start, arc) {
    ctx.beginPath();
    ctx.ellipse(x+width/2+0.5, y+height/2+0.5, width/2, height/2, 0, -start*Math.PI/180, -start*Math.PI/180-arc*Math.PI/180, arc > 0);
    ctx.stroke();
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_fillArc(lib, ctx, x, y, width, height, start, arc) {
    ctx.beginPath();
    ctx.moveTo(x+width/2, y+height/2);
    ctx.ellipse(x+width/2, y+height/2, width/2, height/2, 0, -start*Math.PI/180, -start*Math.PI/180-arc*Math.PI/180, arc > 0);
    ctx.moveTo(x+width/2, y+height/2);
    ctx.fill();
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_drawRect(lib, ctx, x, y, width, height) {
    // 0, 0 doesn't work like in java..
    width = width || 1;
    height = height || 1;

    ctx.strokeRect(x+0.5, y+0.5, width, height);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_clearRect(lib, ctx, x, y, width, height) {
    ctx.clearRect(x, y, width, height);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_fillRect(lib, ctx, x, y, width, height) {
    ctx.fillRect(x, y, width, height);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_drawRoundRect(lib, ctx, x, y, width, height, arcWidth, arcHeight) {
    roundRectPath(ctx, x+0.5, y+0.5, width, height, arcWidth, arcHeight);
    ctx.stroke();
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_fillRoundRect(lib, ctx, x, y, width, height, arcWidth, arcHeight) {
    roundRectPath(ctx, x, y, width, height, arcWidth, arcHeight);
    ctx.fill();
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_drawLine(lib, ctx, x1, y1, x2, y2) {
    // we at least try to be sharp..
    if (y1 === y2) {
      y1 = y1 + 0.5;
      y2 = y2 + 0.5;
    }
    else if (x1 === x2) {
      x1 = x1 + 0.5;
      x2 = x2 + 0.5;
    }

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_drawPolygon(lib, ctx, x, y, n) {
    ctx.beginPath();
    ctx.moveTo(x[0]+0.5, y[0]+0.5);
    for (let t=1;t<n;t++) {
      ctx.lineTo(x[t]+0.5, y[t]+0.5);
    }
    ctx.closePath();
    ctx.stroke();
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_fillPolygon(lib, ctx, x, y, n) {
    ctx.beginPath();
    ctx.moveTo(x[0], y[0]);
    for (let t=1;t<n;t++) {
      ctx.lineTo(x[t], y[t]);
    }
    ctx.closePath();
    ctx.fill();
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_drawText(lib, ctx, text, x, y) {
    ctx.fillText(text, x, y);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_drawImage2(lib, ctx, source, sx, sy, dx, dy, width, height, flipY, withAlpha) {
    if (!withAlpha) {
      // somehow needed?
      ctx.save();
      ctx.fillStyle = 'black';
      ctx.fillRect(dx, dy, width, height);
      ctx.restore();
    }
    if (!flipY) {
      ctx.drawImage(source, sx, sy, width, height, dx, dy, width, height);
    } else {
      ctx.save();
      ctx.translate(dx, dy + height);
      ctx.scale(1, -1);
      ctx.drawImage(source, sx, sy, width, height, 0, 0, width, height);
      ctx.restore();
    }
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_encode(lib, ctx, type) {
    const canvas = ctx.canvas;

    const buffer = await new Promise(resolve => {
      canvas.toBlob(
        async (blob) => {
          resolve(blob ? (await blob.arrayBuffer()) : null);
        },
        type,
        0.9
      );
    });

    if (buffer) {
      return new Int8Array(buffer);
    }
  }

});

export default {
  ...CanvasImage,
  ...CanvasGraphics,
  async Java_pl_zb3_freej2me_bridge_graphics_Utils_getCanvasFromCtx(lib, ctx) {
    return ctx.canvas;
  },
}
