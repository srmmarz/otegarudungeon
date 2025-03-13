//=============================================================================
// Plugin for RPG Maker MV and MZ
// InvokeCommonAtEquipChange.js
//=============================================================================
// [Update History]
// 2022.May.06 Ver1.0.0 first release
// 2022.May.07 Ver1.1.0 Enables to do it when one is unequipped

/*:
 * @target MV MZ
 * @plugindesc [Ver1.1.0]Invoke Common Event When player changes equipment
 * @author Sasuke KANNAZUKI
 *
 * @param commonId
 * @text Default Common Event ID
 * @desc deault commonID when user changes equip.
 * @type common_event
 * @min 0
 * @default 1
 *
 * @param timing
 * @text Event Invoke Timing
 * @desc The timing when it invokes common event
 * @option Just after equip changed
 * @value immediate
 * @option When player close menu
 * @value wait
 * @type select
 * @default wait
 *
 * @param doesInvokeAtNone
 * @text Does invoke when unequip?
 * @desc When player unequip item, invoke common event?
 * @type boolean
 * @on Yes
 * @off No. Only Equip Something
 * @default false
 *
 * @param commonIdAtNone
 * @parent doesInvokeAtNone
 * @text Common Id At Unequipped
 * @desc Common Event Id That Invokes When Player Unequipped
 * @type common_event
 * @min 0
 * @default 1
 *
 * @help This plugin does not provide plugin commands.
 * This plugin runs under RPG Maker MV(Ver1.6.0 or later) and MZ.
 * This plugin enables common event invocation at player changes any equipment.
 *
 * [Summary]
 * When player changes an actor's equipment, invoke specified common event.
 * If you need to change different common event at any equipment,
 * Write down following notation at weapon or armor note.
 * <invokeCommonEventId:12>
 * In this case, it'll invoke common event #12.
 * If you set 0, common event won't invoke.
 *
 * You can select the timing of common event invocation at parameter.
 * - When you select 'Just after equip changed', menu closed immediate and
 *   invoke specified common event.
 * - When you select 'When player close menu', wait until menu is closed.
 *   In this case, there is 2 notes.
 *  - When player change plural equipments, only invoke set last one.
 *  - If you change equip and save the game, common event won't invoke when
 *   load the game.
 *
 * [Advaned Option: When The Actor Become Unequipped]
 * If the actor become uneqipped, you can select invoke it or not by option.
 * If you select invoke it at become unequipped, set the default common event.
 * If you need to change common event at unequip specified equipment,
 * Write down following notation at weapon or armor note.
 * <removeCommonEventId:15>
 * In this case, it'll invoke common event #15.
 * If you set 0, common event won't invoke.
 *
 * [License]
 * this plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

/*:ja
 * @target MV MZ
 * @plugindesc [Ver1.1.0]装備変更時、コモンイベントを起動します
 * @author 神無月サスケ
 *
 * @param commonId
 * @text コモンイベントID
 * @desc 装備変更時に呼び出すデフォルトのコモンイベントID
 * @type common_event
 * @min 0
 * @default 1
 *
 * @param timing
 * @text 起動タイミング
 * @desc いつコモンイベントを起動するか
 * @option 装備変更後即座に
 * @value immediate
 * @option メニューを閉じた時
 * @value wait
 * @type select
 * @default wait
 *
 * @param doesInvokeAtNone
 * @text 装備を外した時も起動するか
 * @desc 装備を外した時もコモンイベントを起動するか
 * @type boolean
 * @on する
 * @off しない
 * @default false
 *
 * @param commonIdAtNone
 * @parent doesInvokeAtNone
 * @text 装備解除時コモンイベント
 * @desc 装備をはずして空欄にした時に起動するコモンイベント
 * @type common_event
 * @min 0
 * @default 1
 *
 * @help このプラグインには、プラグインコマンドはありません。
 * このプラグインは、RPGツクールMV(Ver1.6.0以降)およびMZに対応しています。
 * このプラグインを導入することで、プレイヤーが装備変更時に
 * コモンイベントを呼び出すことが可能になります。
 *
 * ■概要
 * アクターが装備を変更した際にコモンイベントを起動します。
 * 特定の装備に特別なコモンイベントを割り当てたい場合、
 * <invokeCommonEventId:12>
 * というように装備のメモに書きます。この時は12番になります。
 * 0にすると、コモンイベントを起動しません。
 *
 * オプションによって、タイミングが設定可能です。
 * ・「装備変更後即座に」を選択すると、装備後、即座にマップ画面に切り替わり、
 * 　コモンイベントが実行されます。
 * ・「メニューを閉じた時」を選択すると、メニューが閉じるまで待ちます。
 * 　- 複数の装備を変更した場合、最後のコモンイベントだけが実行されます。
 *   - 装備変更後、セーブを行い、ロードした場合は、実行されません。
 *
 * ■追加要素：装備を外した時
 * オプションで装備を外した時にコモンイベントを呼び出すかどうか設定出来ます。
 * その際に起動されるコモンイベントもオプションで設定可能です。
 * もし、特定の装備を外した時に異なるコモンイベントを設定したい場合、
 * <removeCommonEventId:15>
 * の書式でメモに書いてください。この場合は15番になります。
 * 0にすると、コモンイベントを起動しません。
 *
 * ■ライセンス表記
 * このプラグインは MIT ライセンスで配布されます。
 * ご自由にお使いください。
 * http://opensource.org/licenses/mit-license.php
 */

(() => {
  const pluginName = 'invokeCommonAtEquipChange';
  //
  // process parameters
  //
  const parameters = PluginManager.parameters(pluginName);
  const defaultCommonId = Number(parameters['commonId'] || 0);
  const invokeTiming   = parameters['timing'] || 'wait';
  const doesInvokeAtNone = !!eval(parameters['doesInvokeAtNone']);
  const commonIdAtNone = Number(parameters['commonIdAtNone'] || 0);

  //
  // determine common event id to invoke
  //
  const commonIdForTheEquip = item => {
    if (item) {
      let commonId;
      if (commonId = item.meta.invokeCommonEventId) {
        return +commonId;
      }
    }
    return defaultCommonId;
  };

  const commonIdForRemoved = item => {
    if (item) {
      let commonId;
      if (commonId = item.meta.removeCommonEventId) {
        return +commonId;
      }
    }
    return commonIdAtNone;
  };

  const isImmediate = () => invokeTiming === 'immediate';

  const discardOldReservation = () => {
    if ("clearCommonEventReservation" in $gameTemp) { // MZ
      $gameTemp.clearCommonEventReservation();
    }
  };
  //
  // reserve common event
  //
  const _Scene_Equip_onItemOk = Scene_Equip.prototype.onItemOk;
  Scene_Equip.prototype.onItemOk = function() {
    const oldEquip = this.actor().equips()[this._slotWindow.index()];
    const itemToEquip = this._itemWindow.item();
    _Scene_Equip_onItemOk.call(this);
    if (itemToEquip) {
      discardOldReservation();
      $gameTemp.reserveCommonEvent(commonIdForTheEquip(itemToEquip));
    } else if (doesInvokeAtNone) {
      discardOldReservation();
      $gameTemp.reserveCommonEvent(commonIdForRemoved(oldEquip));
    }
    if (isImmediate()) {
      Scene_ItemBase.prototype.checkCommonEvent.call(this);
    }
  };

})();
