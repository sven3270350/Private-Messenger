import { Request, Response } from 'express'
import asyncHandler from '../middleware/asyncHandler'
import axios from "axios";
import fs from 'fs';
import path from 'path';

export const uploadFile = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).send({error: "No files were uploaded."}) as Response;
      }

      const ext = req.file.originalname.split('.').pop();
      const filename = `file-${Date.now()}.${ext}`;
      const bunnyCdnResponse = await axios.put(
        `${process.env.BUNNY_STORAGE_ZONE_URL}/model-cover/${filename}`,
        fs.createReadStream(path.join(__dirname, '..', '..', '..', req.file.path)),
        {
          headers: {
            'AccessKey': process.env.BUNNY_STORAGE_ACCESS_KEY as string,
            'Content-Type': req.file.mimetype
          }
        }
      );

      if(bunnyCdnResponse.data.HttpCode !== 201) {
        return res.status(400).json({success: false, message: bunnyCdnResponse.data.Message }) as Response;
      }

      return res.status(200).json({success: true, url:`${process.env.BUNNY_CDN_EDGE_URL}/model-cover/${filename}` }) as Response;
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({
          error: "Internal server error" + error
        }) as Response;
      }
    }
  }
)