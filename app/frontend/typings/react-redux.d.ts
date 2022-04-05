/* eslint-disable @typescript-eslint/no-explicit-any */

import ApiAction from 'interfaces/ApiAction'
import { Action, AnyAction } from 'redux'

declare module 'react-redux' {
  type InferResponseType<TAction> =
    TAction extends ApiAction<infer RT>
    ? {response: RT }
    : any;

  export interface ApiDispatch<A extends AnyAction> {
    <T extends ApiAction<any>>(action: T): Promise<InferResponseType<T>>
    <T extends A>(action: T): T
  }

  export type InferApiActionCreatorType<TActionCreator extends (...args: any[]) => any> =
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TActionCreator extends (...args: infer TParams) => ApiAction<infer RT>
    ? (...args: TParams) => Promise<InferResponseType<ReturnType<TActionCreator>>>
    : TActionCreator;

  export type HandleApiActionCreator<TActionCreator> =
    TActionCreator extends (...args: any[]) => any
    ? InferApiActionCreatorType<TActionCreator>
    : TActionCreator;

  export type ResolveApiAction<TDispatchProps> =
    TDispatchProps extends { [key: string]: any }
    ? {
      [C in keyof TDispatchProps]: HandleApiActionCreator<TDispatchProps[C]>
    }
    : TDispatchProps;

  export type MapDispatchToPropsForApiActionFunction<TDispatchProps, TOwnProps> =
    (dispatch: ApiDispatch<Action>, ownProps: TOwnProps) => TDispatchProps;

  export interface Connect {
    // tslint:disable:no-unnecessary-generics
    (): InferableComponentEnhancer<DispatchProp>;

    <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}, State = DefaultRootState>(
      mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
      mapDispatchToProps: MapDispatchToPropsForApiActionFunction<TDispatchProps, TOwnProps>
    ): InferableComponentEnhancerWithProps<TStateProps & TDispatchProps, TOwnProps>;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    <no_state = {}, TDispatchProps = {}, TOwnProps = {}, State = DefaultRootState>(
      mapStateToProps: null | undefined,
      mapDispatchToProps: MapDispatchToPropsForApiActionFunction<TDispatchProps, TOwnProps>
    ): InferableComponentEnhancerWithProps<TDispatchProps, TOwnProps>;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    <no_state = {}, TDispatchProps = {}, TOwnProps = {}>(
      mapStateToProps: null | undefined,
      mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>,
    ): InferableComponentEnhancerWithProps<
      ResolveApiAction<TDispatchProps>,
      TOwnProps
    >;

    <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}, State = DefaultRootState>(
      mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
      mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>,
    ): InferableComponentEnhancerWithProps<
      TStateProps & ResolveApiAction<TDispatchProps>,
      TOwnProps
    >;

    <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}, State = DefaultRootState>(
      mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
      mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>,
      mergeProps: null | undefined,
      options: Options<State, TStateProps, TOwnProps>
    ): InferableComponentEnhancerWithProps<
      TStateProps & ResolveApiAction<TDispatchProps>,
      TOwnProps
    >;
    // tslint:enable:no-unnecessary-generics
  }
}
