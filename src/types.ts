import type { InlineConfig } from 'vite'

export interface UpxBuildType {
  entry?: string
  pluginJsonPath: string
  outDir?: string
  packageName?: string
}

export interface BuildFileType {
  entry: string | string[]
  vite?: InlineConfig
}

export interface OptionsType {
  entry: string | string[] | BuildFileType | BuildFileType[]
  upx?: UpxBuildType
}
