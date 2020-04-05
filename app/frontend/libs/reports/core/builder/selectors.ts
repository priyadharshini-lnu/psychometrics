/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import _ from 'lodash'
import { createSelector } from 'reselect'
import { denormalize } from 'normalizr'
import { module, page } from 'libs/reports/store/schema'
import ModuleInterface from '../interfaces/Module'
import PageInterface from '../interfaces/Page'

export const getModules = (state: any, ids: number[]): ModuleInterface[] => denormalize(ids, [module], state)
export const getModule = (state: any, id: number): ModuleInterface => state.modules[id]


export const getPages = (state: any, ids: number[]): PageInterface[] => denormalize(ids, [page], state)
export const getCurrentPage = (state: any): number => state.pages[state.builder.currentPage]
