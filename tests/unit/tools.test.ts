import { describe, it, expect } from 'vitest';
import { mcpSearchTool } from '../../src/tools/mcp-search.js';
import { pdfTool } from '../../src/tools/pdf-generator.js';
import { veoVideoTool } from '../../src/tools/veo-video-generator.js';
import { menuMatcherTool } from '../../src/tools/menu-matcher.js';
import { imagenTool } from '../../src/tools/imagen-generator.js';
import { chirpTtsTool } from '../../src/tools/tts-generator.js';
import { pdfReaderTool } from '../../src/tools/pdf-reader.js';
import fs from 'fs';
import path from 'path';

describe('Fisherman\'s Wharf Agent Tools', () => {
  
  describe('mcpWebSearch tool', () => {
    it('should return mock results for a query', async () => {
      const result = await mcpSearchTool.runAsync({ 
        args: { query: 'best crab' }, 
        toolContext: {} as any 
      }) as any;
      
      expect(result.status).toBe('success');
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].title).toContain('Fisherman\'s Wharf');
    });
  });

  describe('veoVideoTool', () => {
    it('should generate a mock video URL and lip-sync data', async () => {
      const result = await veoVideoTool.runAsync({
        args: {
          action: 'indicate_menu_item',
          itemId: '3',
          textToSync: 'Try the Cioppino',
          language: 'en'
        },
        toolContext: {} as any
      }) as any;

      expect(result.status).toBe('success');
      expect(result.video_url).toContain('veo3-avatar-pointing-cioppino.mp4');
      expect(result.lipSyncData).toBeDefined();
    });
  });

  describe('menuMatcherTool', () => {
    it('should match a menu item based on user speech', async () => {
      const result = await menuMatcherTool.runAsync({
        args: { userSpeech: 'I want some chowder' },
        toolContext: {} as any
      }) as any;

      expect(result.matchedItem).toBeDefined();
      expect(result.matchedItem.name).toContain('Chowder');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should return null if no match is found', async () => {
      const result = await menuMatcherTool.runAsync({
        args: { userSpeech: 'I want a pizza' },
        toolContext: {} as any
      }) as any;

      expect(result.matchedItem).toBeNull();
      expect(result.confidence).toBe(0);
    });
  });

  describe('imagenTool', () => {
    it('should return a mock image URL', async () => {
      const result = await imagenTool.runAsync({
        args: { prompt: 'delicious seafood platter' },
        toolContext: {} as any
      }) as any;

      expect(result.status).toBe('success');
      expect(result.image_url).toBeDefined();
    });
  });

  describe('chirpTtsTool', () => {
    it('should return a mock audio URL with a specific voice style', async () => {
      const result = await chirpTtsTool.runAsync({
        args: { 
          text: 'Welcome to the Wharf',
          voice_style: 'sophisticated_host'
        },
        toolContext: {} as any
      }) as any;

      expect(result.status).toBe('success');
      expect(result.audio_url).toContain('en-GB-Wavenet-F.mp3');
      expect(result.voice_used).toBe('sophisticated_host');
    });

    it('should support gourmet and historian voices', async () => {
      const gourmet = await chirpTtsTool.runAsync({
        args: { text: 'Delicious!', voice_style: 'passionate_gourmet' },
        toolContext: {} as any
      }) as any;
      expect(gourmet.voice_used).toBe('passionate_gourmet');

      const historian = await chirpTtsTool.runAsync({
        args: { text: 'Since 1849...', voice_style: 'local_historian' },
        toolContext: {} as any
      }) as any;
      expect(historian.voice_used).toBe('local_historian');
    });
  });



  describe('pdfReaderTool', () => {
    it('should return mock PDF content', async () => {
      const result = await pdfReaderTool.runAsync({
        args: { pdf_path: 'test.pdf' },
        toolContext: {} as any
      }) as any;

      expect(result.status).toBe('success');
      expect(result.content).toBeDefined();
    });
  });

  describe('pdfGenerator tool', () => {

    it('should generate a PDF file', async () => {
      const outputPath = path.join(process.cwd(), 'fishermans_wharf_report.pdf');
      
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }

      const result = await pdfTool.runAsync({ 
        args: { 
          report: 'Test report content',
          images: ['https://example.com/image.jpg']
        }, 
        toolContext: {} as any 
      }) as any;

      expect(result.status).toBe('success');
      expect(fs.existsSync(outputPath)).toBe(true);
      
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    });
  });
});
