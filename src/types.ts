import type { InlineConfig } from 'vite'

export enum BuildMode { IncludeDependencies, ExcludeDependencies }
export interface UpxBuildType {
  entry?: string
  pluginJsonPath: string
  outDir?: string
  packageName?: string
}

export interface BuildFileType {
  entry: string | string[]
  vite?: InlineConfig
  mode?: BuildMode
}

export interface BuildJsonType {
  outdir?: string
  entry: string
  address: string
}

export interface OptionsType {
  entry: BuildFileType | BuildFileType[]
  upx?: false | UpxBuildType
  hmr?: false | { pluginJsonPath?: string }
}
