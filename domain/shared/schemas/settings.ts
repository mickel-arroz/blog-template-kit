import { z } from 'zod';

/**
 * Global Settings schema for the blog. Single row / singleton pattern.
 */
export const SettingsIdSchema = z.literal('singleton');

export const ThemeModeSchema = z.enum(['light', 'dark', 'system']);

export const SettingsSchema = z.object({
  id: SettingsIdSchema.default('singleton'),
  siteName: z.string().min(1).max(80),
  siteDescription: z.string().max(300).optional().default(''),
  logoUrl: z.string().url().optional(),
  faviconUrl: z.string().url().optional(),
  theme: ThemeModeSchema.default('system'),
  homepageHeroTitle: z.string().max(160).optional(),
  homepageHeroSubtitle: z.string().max(240).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Settings = z.infer<typeof SettingsSchema>;

export const UpdateSettingsSchema = SettingsSchema.partial().extend({
  id: SettingsIdSchema.optional(),
});
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
