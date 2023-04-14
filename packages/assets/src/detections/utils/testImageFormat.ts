import { canLoadImageBitmap, loadImageBitmap } from '../../utils/loadImageBitmap';

const inWorker = 'WorkerGlobalScope' in globalThis
    && globalThis instanceof (globalThis as any).WorkerGlobalScope;

export async function testImageFormat(dataURL: string): Promise<boolean>
{
    if (!dataURL.startsWith('data:image/'))
    {
        throw new Error('Invalid image data URL');
    }

    const useLoadImageBitmap = await canLoadImageBitmap();

    if (useLoadImageBitmap || inWorker)
    {
        if (!useLoadImageBitmap)
        {
            return false;
        }

        try
        {
            const imageBitmap = await loadImageBitmap(dataURL);
            const valid = imageBitmap.width > 0 && imageBitmap.height > 0;

            imageBitmap.close();

            return valid;
        }
        catch (e)
        {
            return false;
        }
    }

    return new Promise((resolve) =>
    {
        const image = document.createElement('img');

        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(true);
        image.onerror = () => resolve(false);
        image.src = dataURL;
    });
}