import * as t from 'io-ts'
import type { TableProps } from 'antd'

export const NormTR = t.type({
  id: t.string,
  name: t.string,
  disabled: t.boolean,
  createdAt: t.string,
  updatedAt: t.string,
  normType: t.string,
  dimension: t.union([
    t.type({
      id: t.string,
      name: t.string,
    }),
    t.undefined,
  ]),

  owner: t.union([
    t.type({
      id: t.string,
      name: t.string,
    }),
    t.undefined,
  ]),

  updatedBy: t.union([
    t.type({
      id: t.string,
      name: t.string,
    }),
    t.undefined,
  ]),
  meta: t.type({
    permissions: t.type({
      edit: t.boolean,
      copy: t.boolean,
      delete: t.boolean,
      export: t.boolean,
      editor: t.boolean,
    }),
  }),
})

export type Norm = t.TypeOf<typeof NormTR>

export const Schema = {
  type: 'norms',
  relationships: {
    owner: {
      type: 'clients',
    },
    dimension: {
      type: 'dimensions',
    },
    updatedBy: {
      type: 'users',
    },
  },
}

export const NormEditorTR = t.array(
  t.type({
    id: t.number,
    name: t.string,
    factorsNormId: t.union([t.number, t.undefined]),
    factorsNormsProps: t.union([t.undefined, t.array(
      t.type({
        level: t.string,
        scoreFrom: t.union([t.number, t.string]),
        scoreTo: t.union([t.number, t.string]),
      }),
    ),

    t.array(t.type({
      factor: t.string,
      mean: t.union([t.number, t.string]),
      standardDeviation: t.union([t.number, t.string]),
    })),
    ]),
  }),
)

export type NormEditor = t.TypeOf<typeof NormEditorTR>

export const NormEditorResponseTR = t.type({
  data: NormEditorTR,
})

export type NormEditorResponse = t.TypeOf<typeof NormEditorResponseTR>

export interface IFiveScaleRowData {
  factor: string;
  veryLowFrom: number | string;
  veryLowTo: number | string;
  lowFrom: number | string;
  lowTo: number | string;
  averageFrom: number | string;
  averageTo: number | string;
  highFrom: number | string;
  highTo: number | string;
  veryHighFrom: number | string;
  veryHighTo: number | string;
  key: string;
  factorsNormId: number | string;
}

export interface IPercentileRowData {
  factor: string;
  mean: number | string | undefined;
  standardDeviation: number | string | undefined;
  key: string;
  factorsNormId: number | string;
}

export type ColumnTypes = Exclude<TableProps<IFiveScaleRowData | IPercentileRowData>['columns'], undefined>;

export interface EditableCellProps {
  editable: boolean;
  editing: boolean;
  children: React.ReactNode;
  save: {
    startEdit: (record: IFiveScaleRowData |
       IPercentileRowData, dataIndex: keyof (IFiveScaleRowData | IPercentileRowData)) => void;
    commit: (record: IFiveScaleRowData |
      IPercentileRowData, dataIndex: keyof (IFiveScaleRowData | IPercentileRowData)) => void;
  };
  dataIndex: keyof (IFiveScaleRowData | IPercentileRowData);
  record: IFiveScaleRowData | IPercentileRowData;
}
