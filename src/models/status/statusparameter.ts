import * as api from '@/api/api';
import Enumerable from 'linq';
import Vue from 'vue';

export enum StatusParameterType {
  /**
   * 最大値が存在する値（農業、商業など）
   */
  ranged = 1,
  /**
   * 値だけ（武力、知力など）
   */
  noRange = 2,
  /**
   * テキスト値
   */
  text = 3,
  /**
   * 武将のアイコン
   */
  characterIcon = 4,
  /**
   * noRnageとrangedの順に並べてくっつけたもの
   */
  twinNoRangeAndRanged = 5,
  /**
   * 遅延ロードされる値
   */
  noRangeDelay = 6,
}

export abstract class StatusParameter {
  public abstract get type(): StatusParameterType;

  public constructor(public readonly name: string) {}
}

export class RangedStatusParameter extends StatusParameter {
  public get type(): StatusParameterType {
    return StatusParameterType.ranged;
  }

  public get valueRatio(): number {
    if (this.max !== 0) {
      return this.value / this.max * 100;
    } else {
      return 0;
    }
  }

  public constructor(name: string, public value: number, public max: number) {
    super(name);
  }
}

export class NoRangeStatusParameter extends StatusParameter {
  public get type(): StatusParameterType {
    return StatusParameterType.noRange;
  }

  public constructor(name: string, public value: number) {
    super(name);
  }
}

export class NoRangeDelayStatusParameter extends NoRangeStatusParameter {
  public isLoading: boolean = true;

  public get type(): StatusParameterType {
    return StatusParameterType.noRangeDelay;
  }

  public constructor(name: string) {
    super(name, 0);
  }
}

export class TextStatusParameter extends StatusParameter {
  public get type(): StatusParameterType {
    return StatusParameterType.text;
  }

  public constructor(name: string, public value: string) {
    super(name);
  }
}

export class CharacterIconStatusParameter extends StatusParameter {
  public get type(): StatusParameterType {
    return StatusParameterType.characterIcon;
  }

  public constructor(name: string, public icons: api.CharacterIcon[]) {
    super(name);
  }
}

export class TwinNoRangeAndRangedStatusParameter extends NoRangeStatusParameter {
  private readonly ranged: RangedStatusParameter;

  public get type(): StatusParameterType {
    return StatusParameterType.twinNoRangeAndRanged;
  }

  public get extraName(): string {
    return this.ranged.name;
  }

  public get extraValue(): number {
    return this.ranged.value;
  }

  public set extraValue(value: number) {
    this.ranged.value = value;
  }

  public get extraMax(): number {
    return this.ranged.max;
  }

  public set extraMax(value: number) {
    this.ranged.max = value;
  }

  public get extraValueRadio(): number {
    return this.ranged.valueRatio;
  }

  public constructor(name: string, value: number, extraName: string, extraValueVal: number, extraMaxVal: number) {
    super(name, value);
    this.ranged = new RangedStatusParameter(extraName, extraValueVal, extraMaxVal);
  }
}
