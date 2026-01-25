import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. OBTENER CONFIGURACIÓN
export const getSettings = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("orgSettings")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .first();
      
    // Si tiene logo, generamos la URL pública
    let logoUrl = null;
    if (settings?.logoStorageId) {
      logoUrl = await ctx.storage.getUrl(settings.logoStorageId);
    }

    return { ...settings, logoUrl };
  },
});

// 2. ACTUALIZAR COLOR
export const updateColor = mutation({
  args: { orgId: v.string(), color: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("orgSettings")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { primaryColor: args.color });
    } else {
      await ctx.db.insert("orgSettings", { 
        orgId: args.orgId, 
        primaryColor: args.color 
      });
    }
  },
});

// 3. GENERAR URL DE SUBIDA (Para el Logo)
export const generateLogoUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// 4. GUARDAR LOGO (Después de subirlo)
export const updateLogo = mutation({
  args: { orgId: v.string(), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("orgSettings")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .first();

    if (existing) {
      // Si ya tenía logo, lo borramos para no ocupar espacio al pedo
      if (existing.logoStorageId) {
          // Nota: Convex no tira error si el archivo ya no existe, es seguro.
          await ctx.storage.delete(existing.logoStorageId); 
      }
      await ctx.db.patch(existing._id, { logoStorageId: args.storageId });
    } else {
      await ctx.db.insert("orgSettings", { 
        orgId: args.orgId, 
        logoStorageId: args.storageId 
      });
    }
  },
});