<template>
  <div id="status-root" class="container-fluid loading-container">
    <div class="row">
      <!-- 左カラム -->
      <div class="col-lg-7 col-md-6">
        <div id="current-display-wrapper">
          <div id="system-button-group">
            <ul class="nav nav-pills">
              <li class="nav-item">
                <a :class="{'nav-link': true, 'active': mapShowType === 0}" href="#" @click.prevent.stop="mapShowType = 0">地図</a>
              </li>
              <li class="nav-item">
                <a :class="{'nav-link': true, 'active': mapShowType === 1}" href="#" @click.prevent.stop="mapShowType = 1">ON</a>
              </li>
              <li class="nav-item">
                <a :class="{'nav-link': true, 'active': mapShowType === 2}" href="#" @click.prevent.stop="mapShowType = 2"><span class="tab-text">武将<span class="tab-notify" v-show="model.hasPendingItems || model.character.countryId === 0 || model.selectableSkillCount > 1"></span></span></a>
              </li>
            </ul>
          </div>
          <div id="current-display">
            <span class="number">{{ model.gameDate.year }}</span><span class="unit">年</span>
            <span class="number">{{ model.gameDate.month }}</span><span class="unit">月</span>
            <span class="month-timer">{{ model.monthTimer }}</span>
          </div>
          <div id="current-war-status" class="in-battle-royal" v-if="model.characterCountryWarWorstStatus.id === 999">全国戦争中</div>
          <div id="current-war-status" class="in-war" v-if="model.characterCountryWarWorstStatus.id === 1">戦争中</div>
          <div id="current-war-status" class="in-war" v-if="model.characterCountryWarWorstStatus.id === 2">停戦協議中</div>
          <div id="current-war-status" class="in-ready" v-if="model.characterCountryWarWorstStatus.id === 4">戦争準備中</div>
          <div id="current-war-status" class="in-reset" v-if="model.systemData.isWaitingReset">{{ model.systemData.resetGameDateTime.year }}年終了</div>
        </div>
        <div id="directive" :class="'country-color-' + model.characterCountryColor" @click="isOpenCommandersDialog = true">
          指令: <KmyChatTagText :text="model.store.myCountryCommanderAll.message" :isNewLine="false"/>
        </div>
        <div id="map-container" :class="{'mini-mode': mapMode === 9}">
          <Map
            v-show="mapShowType === 0"
            :towns="model.towns"
            :countries="model.countries"
            :town="model.town"
            :currentTown="model.characterTown"
            :mode="mapMode"
            :store="model.store"
            isMonarchIcon="true"
            @selected="model.selectTown($event)"/>
          <div v-show="mapShowType === 1" class="online-list">
            <div class="alert alert-info">
              あなたのオン率は <strong>{{ (model.onlineCount * 100 / model.gameDateTimeNumber).toFixed(1) }}</strong>% で <strong>{{ model.onlineRank }}</strong> 位です
            </div>
            <div class="online-list-item">
              <h3>ACTIVE</h3>
              <MiniCharacterList
                :countries="model.countries"
                :characters="model.onlines.activeCharacters"/>
            </div>
            <div class="online-list-item">
              <h3>INACTIVE</h3>
              <MiniCharacterList
                :countries="model.countries"
                :characters="model.onlines.inactiveCharacters"/>
            </div>
          </div>
          <div v-show="mapShowType === 2" :class="'character-information country-color-' + model.characterCountryColor" @scroll="onCharacterLogScrolled($event)">
            <h4 :class="'country-color-' + model.characterCountryColor"><CharacterIcon :icons="model.characterIcons"/>{{ model.character.name }}</h4>
            <div class="alert alert-warning" v-show="model.hasPendingItems">保留中のアイテムがあります</div>
            <div class="alert alert-warning" v-if="model.character.countryId === 0">現在 無所属 です。どこかの国に仕官しましょう</div>
            <div class="alert alert-warning" v-if="model.selectableSkillCount > 1">選択可能な技能が 2 以上あるため自動獲得されません。手動で獲得しましょう</div>
            <div class="commands">
              <button type="button" class="btn btn-info" @click="isOpenSkillDialog = true">技能</button>
              <button type="button" class="btn btn-info" @click="isOpenFormationDialog = true">陣形</button>
              <button type="button" class="btn btn-info" @click="isOpenCharacterItemDialog = true">アイテム</button>
              <button type="button" class="btn btn-info" @click="model.unitModel.updateUnits(); isOpenUnitsDialog = true">部隊</button>
              <span v-show="model.readyForReinforcement"
                    v-for="rein in model.store.reinforcements"
                    :key="rein.id">
                <button v-show="rein.status === 1" type="button" class="btn btn-warning loading-container" @click="model.setReinforcementStatus(model.character, 4, rein.requestedCountryId)">{{ model.getCountry(rein.requestedCountryId).name }}へ援軍<div class="loading" v-show="model.isUpdatingReinforcement"><div class="loading-icon"></div></div></button>
                <button v-show="rein.status === 1" type="button" class="btn btn-danger loading-container" @click="model.setReinforcementStatus(model.character, 2, rein.requestedCountryId)">拒否<div class="loading" v-show="model.isUpdatingReinforcement"><div class="loading-icon"></div></div></button>
              </span>
              <span v-show="!model.readyForReinforcement">
                <button type="button" class="btn btn-warning loading-container" @click="model.setReinforcementStatus(model.character, 5)">帰還<div class="loading" v-show="model.isUpdatingReinforcement"><div class="loading-icon"></div></div></button>
              </span>
            </div>
            <div class="content-main character-information-main">
              <StatusParametersPanel :parameters="model.characterParameters"/>
            </div>

            <div class="alert alert-info" v-if="model.regularlyCommand">
              定期実行: <strong>{{ model.regularlyCommand.name }}</strong> <button type="button" class="btn btn-sm btn-warning" style="margin-left:16px;transform:translateY(2px)">削除</button>
            </div>
            <div class="alert alert-info" v-else>現在、定期実行コマンドは設定されていません</div>

            <div class="content-main character-logs">
              <MapLogList :logs="model.characterLogs" type="character-log" @battle-log="battleLogId = $event; isOpenBattleLogDialog = true"/>
              <div v-show="model.isLoadingMoreCharacterLogs" class="loading-container load-more">
                <div class="loading" style="height:48px"><div class="loading-icon"></div></div>
              </div>
            </div>
          </div>
        </div>
        <div id="information-mode-tab">
          <ul class="nav nav-pills nav-fill">
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedInformationTab === 0 }" @click.prevent.stop="selectedInformationTab = 0; mapShowType = 0; model.isMapLogTabOpen = false" href="#">都市</a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedInformationTab === 2 }" @click.prevent.stop="selectedInformationTab = 2; mapShowType = 0; model.isMapLogTabOpen = false" href="#">国</a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedInformationTab === 4 }" @click.prevent.stop="selectedInformationTab = 4; mapShowType = 0; model.isMapLogTabOpen = false" href="#">データ</a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedInformationTab === 3 }" @click.prevent.stop="selectedInformationTab = 3; model.isMapLogTabOpen = true" href="#"><span class="tab-text">情勢<span class="tab-notify" v-show="model.isMapLogTabUnread"></span></span></a></li>
          </ul>
        </div>
        <!-- 都市情報 -->
        <div v-show="selectedInformationTab === 0" :class="'information-content information-town country-color-' + model.townCountryColor + (mapMode === 9 ? ' mini-mode' : '')">
          <h4 :class="'country-color-' + model.townCountryColor">
            <div class="header">
              {{ model.town.name }}
              <span v-if="model.town.scoutedGameDateTime && model.town.id !== model.character.townId">（{{ model.town.scoutedGameDateTime | gamedate }} 時点）</span>
              <span v-if="model.town.scoutedGameDateTime && model.town.id === model.character.townId">（最終諜報：{{ model.town.scoutedGameDateTime | gamedate }}）</span>
            </div>
          </h4>
          <div class="content-main">
            <StatusParametersPanel :parameters="model.townParameters"/>
            <MiniCharacterList
              :countries="model.countries"
              :characters="model.townCharacters"/>
          </div>
          <div class="commands">
            <button v-show="model.town.id === model.character.townId || model.town.countryId === model.character.countryId" type="button" class="btn btn-info" @click="isOpenTownCharactersDialog = true">滞在</button>
            <button v-show="model.town.id === model.character.townId || model.town.countryId === model.character.countryId" type="button" class="btn btn-info" @click="isOpenTownDefendersDialog = true">守備</button>
            <button v-show="model.town.id === model.character.townId && model.town.countryId !== model.character.countryId" type="button" class="btn btn-secondary loading-container" :style="{ 'pointer-events': model.isScouting ? 'none' : 'all' }" @click="model.scoutTown()">諜報<div v-show="model.isScouting" class="loading"><div class="loading-icon"></div></div></button>
            <button v-show="model.town.scoutedGameDateTime && model.town.id !== model.character.townId" type="button" class="btn btn-info" @click="isOpenTownCharactersDialog = true">諜報時点滞在</button>
            <button v-show="model.town.scoutedGameDateTime && model.town.id !== model.character.townId" type="button" class="btn btn-info" @click="isOpenTownDefendersDialog = true">諜報時点守備</button>
            <button type="button" class="btn btn-secondary loading-container" @click="model.commands.inputer.inputMoveCommand(17)">移動<div v-show="model.isCommandInputing" class="loading"><div class="loading-icon"></div></div></button>
            <button type="button" class="btn btn-secondary loading-container" @click="model.commands.inputer.inputMoveCommand(13)">戦争<div v-show="model.isCommandInputing" class="loading"><div class="loading-icon"></div></div></button>
            <button v-show="model.character.countryId && model.country.id !== model.character.countryId && !model.systemData.isBattleRoyaleMode && model.systemData.ruleSet !== 2" type="button" class="btn btn-info" @click="isOpenTownWarDialog = true">攻略</button>
            <button type="button" class="btn btn-info" v-show="model.character.countryId && model.systemData.ruleSet !== 2" @click="model.updateTownBuyCost(); isOpenBuyTownDialog = true">購入</button>
          </div>
        </div>
        <!-- 国情報 -->
        <div v-show="selectedInformationTab === 2" :class="'information-content information-country country-color-' + model.country.colorId + (mapMode === 9 ? ' mini-mode' : '')">
          <h4 :class="'country-color-' + model.country.colorId">
            <div class="header">{{ model.country.name }}</div>
          </h4>
          <div class="content-main">
            <StatusParametersPanel :parameters="model.countryParameters"/>
            <div v-if="!model.systemData.isWaitingReset">
              <div v-show="model.country.isHaveGyokuji" class="alert alert-info">この国は玉璽を持っています。<strong>{{ model.country.gyokujiGameDate.year + 10 * 12 }}</strong> 年 <strong>{{ model.country.gyokujiGameDate.month }}</strong> 月 までに所有すると統一勝利する可能性があります</div>
              <div class="alert alert-info">宗教勝利の進捗状況　都市: <strong>{{ model.countryReligionTownCount }}</strong> / <strong>{{ model.townCountForReligionWin }}</strong> 、国: <strong>1</strong> / <strong>{{ model.sameReligionCountryCount }}</strong><span v-if="!model.isAllTownHaveReligion"><br>まだすべての都市が宗教を信仰していません</span></div>
            </div>
          </div>
          <div class="commands">
            <button type="button" class="btn btn-info" @click="model.updateCountryCharacters(); isOpenCountryCharactersDialog = true">武将</button>
            <button v-show="model.town.countryId && model.country.id === model.character.countryId" type="button" class="btn btn-info" @click="isOpenPoliciesDialog = true">政策</button>
            <button v-show="model.character.countryId && model.town.countryId && model.country.id === model.character.countryId" type="button" class="btn btn-info" @click="model.unitModel.updateUnits(); isOpenUnitsDialog = true">部隊</button>
            <button v-show="model.character.countryId && model.town.countryId && model.country.id !== model.character.countryId && !model.country.aiType && !model.systemData.isBattleRoyaleMode" type="button" class="btn btn-info" @click="isOpenAllianceDialog = true">同盟</button>
            <button v-show="model.character.countryId && model.town.countryId && model.country.id !== model.character.countryId && !model.systemData.isBattleRoyaleMode" type="button" class="btn btn-info" @click="isOpenWarDialog = true; selectedWarStatus = -1">戦争</button>
            <button v-if="false" v-show="model.character.countryId && model.town.countryId && model.country.id !== model.character.countryId && model.canDiplomacy && !model.country.aiType" type="button" class="btn btn-warning" @click="mapDialogMode = 6; isOpenMapDialog = true">割譲</button>
            <button v-show="model.town.countryId && model.country.id !== model.character.countryId && model.canDiplomacy && !model.country.aiType" type="button" class="btn btn-warning" @click="readyOtherCountryChat(model.country)">国宛</button>
          </div>
        </div>
        <!-- データ -->
        <div v-show="selectedInformationTab === 4" :class="'information-content information-data country-color-' + model.characterCountryColor + (mapMode === 9 ? ' mini-mode' : '')">
          <h4 :class="'country-color-' + model.characterCountryColor">
            <div class="header">データ
              <span v-show="mapMode === 1">【滞在】</span>
              <span v-show="mapMode === 2">【守備】</span>
              <span v-show="mapMode === 3">【滞在】</span>
              <span v-show="mapMode === 4">【守備】</span>
              <span v-show="mapMode === 5">【農・商】</span>
              <span v-show="mapMode === 6">【技・壁】</span>
              <span v-show="mapMode === 7">【人・技】</span>
              <span v-show="mapMode === 8">【人・忠・技】</span>
            </div>
          </h4>
          <div class="content-main">
            <div class="buttons">
              <button type="button" :class="{'btn': true, 'btn-secondary': mapMode === 0, 'btn-outline-secondary': mapMode !== 0}" @click="mapMode = 0">なし</button>
              <button type="button" :class="{'btn': true, 'btn-secondary': mapMode === 9, 'btn-outline-secondary': mapMode !== 9}" @click="mapMode = 9">一覧</button>
              <button type="button" :class="{'btn': true, 'btn-secondary': mapMode === 1, 'btn-outline-secondary': mapMode !== 1}" @click="mapMode = 1">滞</button>
              <button type="button" :class="{'btn': true, 'btn-secondary': mapMode === 3, 'btn-outline-secondary': mapMode !== 3}" @click="mapMode = 3">数</button>
              <button type="button" :class="{'btn': true, 'btn-secondary': mapMode === 2, 'btn-outline-secondary': mapMode !== 2}" @click="mapMode = 2">守</button>
              <button type="button" :class="{'btn': true, 'btn-secondary': mapMode === 4, 'btn-outline-secondary': mapMode !== 4}" @click="mapMode = 4">数</button>
            </div>
            <div v-show="mapMode !== 9">
              <h3>滞在武将</h3>
              <MiniCharacterList
                :countries="model.countries"
                :characters="model.townCharactersForData"/>
              <h3 v-show="model.town.countryId === model.character.countryId">守備武将</h3>
              <MiniCharacterList
                v-show="model.town.countryId === model.character.countryId"
                :countries="model.countries"
                :characters="model.townDefenders"/>
            </div>
            <div v-if="mapMode === 9" class="data-list">
              <TownList :store="model.store" :town="model.town" @selected="model.selectTown($event)"/>
            </div>
          </div>
        </div>
        <!-- 報告 -->
        <div v-show="selectedInformationTab === 3" :class="'information-content information-logs country-color-' + model.country.colorId + (mapMode === 9 ? ' mini-mode' : '')">
          <h4><div class="header">情勢</div></h4>
          <div class="content-main" @scroll="onMapLogScrolled($event)">
            <MapLogList :logs="model.mapLogs" type="normal" isShowBattleLog="true" @battle-log="battleLogId = $event; isOpenBattleLogDialog = true"/>
            <div v-show="model.isLoadingMoreMapLogs" class="loading-container load-more">
              <div class="loading" style="height:48px"><div class="loading-icon"></div></div>
            </div>
          </div>
        </div>
      </div>
      <!-- 右カラム -->
      <div class="col-lg-5 col-md-6">
        <div id="right-side-mode-tab">
          <ul class="nav nav-pills nav-fill">
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedActionTab === 0 }" @click.prevent.stop="selectedActionTab = 0" href="#"><span class="tab-text"><span v-show="selectedActionTab === 0">コマンド</span><span v-show="selectedActionTab !== 0">残り {{ model.commands.restTurns }}</span><span class="tab-notify" v-show="model.commands.isFewRemaining ||
                (model.store.myCountryCommanderAll.message && model.store.myCountryCommanderAll.id > model.store.chatMessageRead.lastAllCommanderId) ||
                (model.store.myCountryCommanderAttribute.message && model.store.myCountryCommanderAttribute.id > model.store.chatMessageRead.lastAttributeCommanderId) ||
                (model.store.myCountryCommanderFrom.message && model.store.myCountryCommanderFrom.id > model.store.chatMessageRead.lastFromCommanderId) ||
                (model.store.myCountryCommanderPrivate.message && model.store.myCountryCommanderPrivate.id > model.store.chatMessageRead.lastPrivateCommanderId)"></span></span></a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedActionTab === 1 }" @click.prevent.stop="selectedActionTab = 1" href="#"><span class="tab-text">手紙<span class="tab-notify" v-show="model.countryChat.isUnread || model.privateChat.isUnread || model.globalChat.isUnread || model.global2Chat.isUnread"></span></span></a></li>
            <li class="nav-item" v-if="model.character.countryId"><a :class="{ 'nav-link': true, 'active': selectedActionTab === 2 }" @click.prevent.stop="selectedActionTab = 2" href="#"><span class="tab-text">会議室<span class="tab-notify" v-show="model.countryThreadBbs.isUnread"></span></span></a></li>
            <li class="nav-item dropdown" :class="{ 'tab-highlighted': !model.character.countryId }"><a :class="'nav-link dropdown-toggle' + (isOpenRightSidePopupMenu || selectedActionTab === 3 ? ' active' : '')" href="#" @click.prevent.stop="isOpenRightSidePopupMenu ^= true">
                <span class="tab-text">
                  <span v-show="selectedActionTab !== 3">メニュー</span>
                  <span v-show="selectedActionTab === 3 && selectedActionTabSubPanel === 0">登用<span v-if="!model.character.countryId"> ({{ model.promotions.count }})</span></span>
                  <span v-show="selectedActionTab === 3 && selectedActionTabSubPanel === 1">国設定</span>
                  <span v-show="selectedActionTab === 3 && selectedActionTabSubPanel === 2">全会</span>
                  <span v-show="selectedActionTab === 3 && selectedActionTabSubPanel === 5">個設定</span>
                  <span v-show="selectedActionTab === 3 && selectedActionTabSubPanel === 6">戦闘S</span>
                  <span v-show="selectedActionTab === 3 && selectedActionTabSubPanel === 7">米S</span>
                  <span v-show="selectedActionTab === 3 && selectedActionTabSubPanel === 8">アカウント</span>
                  <span v-show="selectedActionTab === 3 && selectedActionTabSubPanel === 9">BBS</span>
                  <span class="tab-notify" v-show="model.promotions.isUnread || model.globalThreadBbs.isUnread || model.isIssueBbsUnread"></span>
                </span>
              </a>
              <div class="dropdown-menu" :style="'right:0;left:auto;display:' + (isOpenRightSidePopupMenu ? 'block' : 'none')">
                <a :class="{ 'dropdown-item': true, 'tab-highlighted': !model.character.countryId }" href="#" @click.prevent.stop="selectedActionTab = 3; selectedActionTabSubPanel = 0; isOpenRightSidePopupMenu = false"><span class="tab-text">登用<span class="tab-notify" v-show="model.promotions.isUnread"></span></span></a>
                <a class="dropdown-item" href="#" @click.prevent.stop="selectedActionTab = 3; selectedActionTabSubPanel = 2; isOpenRightSidePopupMenu = false"><span class="tab-text">全国会議室<span class="tab-notify" v-show="model.globalThreadBbs.isUnread"></span></span></a>
                <a v-if="model.canCountrySetting || model.canCountryCommander" class="dropdown-item" href="#" @click.prevent.stop="selectedActionTab = 3; selectedActionTabSubPanel = 1; isOpenRightSidePopupMenu = false">国設定</a>
                <a class="dropdown-item" href="#" @click.prevent.stop="selectedActionTab = 3; selectedActionTabSubPanel = 5; isOpenRightSidePopupMenu = false">個人設定</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#" @click.prevent.stop="model.updateOppositionCharacters(); isOpenOppositionCharactersDialog = true; isOpenRightSidePopupMenu = false">無所属武将</a>
                <a v-if="!isApp" class="dropdown-item" href="https://sangoku.kmycode.net/characters" target="_blank" @click="isOpenRightSidePopupMenu = false">登録武将一覧</a>
                <a v-if="!isApp" class="dropdown-item" href="https://sangoku.kmycode.net/ranking" target="_blank" @click="isOpenRightSidePopupMenu = false">ランキング</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#" @click.prevent.stop="selectedActionTab = 3; selectedActionTabSubPanel = 8; isOpenRightSidePopupMenu = false">アカウント</a>
                <a class="dropdown-item" href="#" @click.prevent.stop="selectedActionTab = 3; selectedActionTabSubPanel = 9; isOpenRightSidePopupMenu = false"><span class="tab-text">BBS<span class="tab-notify" v-show="model.isIssueBbsUnread"></span></span></a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#" @click.prevent.stop="selectedActionTab = 3; selectedActionTabSubPanel = 6; isOpenRightSidePopupMenu = false">模擬戦闘</a>
                <a class="dropdown-item" href="#" @click.prevent.stop="selectedActionTab = 3; selectedActionTabSubPanel = 7; isOpenRightSidePopupMenu = false">模擬米施し</a>
                <div class="dropdown-divider"></div>
                <a v-if="!isApp" class="dropdown-item" href="https://w.atwiki.jp/sangokukmy9/pages/10.html" target="_blank" @click="isOpenRightSidePopupMenu = false">説明書</a>
                <a v-if="!isApp" class="dropdown-item" href="https://w.atwiki.jp/sangokukmy9/" target="_blank" @click="isOpenRightSidePopupMenu = false">Wiki</a>
                <a v-if="!isApp" class="dropdown-item" href="https://w.atwiki.jp/sangokukmy9/pages/77.html" target="_blank" @click="isOpenRightSidePopupMenu = false">初心者向け解説</a>
                <a v-if="isApp" class="dropdown-item" href="#" @click="reloadPage()">画面更新</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#" @click.prevent.stop="model.logout(); $router.push('home');">ログアウト</a>
              </div>
            </li>
          </ul>
        </div>
        <!-- コマンド入力 -->
        <div v-show="selectedActionTab === 0" class="right-side-content content-command" style="display:flex;flex-direction:column">
          <CommandListView :list="model.commands"
                           :characterDeleteTurn="model.character.deleteTurn"
                           :canSafeOut="model.canSafeOut"
                           :canSecretary="model.canSecretary"
                           :canCommandComment="model.canCommandComment"
                           :canSubBuilding="model.canSubBuilding"
                           :gameDate="model.gameDate"
                           @open="openCommandDialog($event)"
                           @open-commander-message="isOpenCommandersDialog = true"/>
        </div>
        <!-- 手紙 -->
        <div v-show="selectedActionTab === 1" class="right-side-content content-chat" style="display:flex;flex-direction:column">
          <!-- 手紙の種類選択のタブ -->
          <ul v-show="selectedActionTab === 1" class="nav nav-pills nav-fill">
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedChatCategory === 0 }" @click.prevent.stop="selectedChatCategory = 0" href="#"><span class="tab-text">自国<span class="tab-notify" v-show="model.countryChat.isUnread"></span></span></a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedChatCategory === 1 }" @click.prevent.stop="selectedChatCategory = 1" href="#"><span class="tab-text">個人<span class="tab-notify" v-show="model.privateChat.isUnread"></span></span></a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedChatCategory === 5 }" @click.prevent.stop="selectedChatCategory = 5" href="#"><span class="tab-text">全国1<span class="tab-notify" v-show="model.globalChat.isUnread"></span></span></a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedChatCategory === 6 }" @click.prevent.stop="selectedChatCategory = 6" href="#"><span class="tab-text">全国2<span class="tab-notify" v-show="model.global2Chat.isUnread"></span></span></a></li>
            <!-- <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedChatCategory === 2 }" @click.prevent.stop="selectedChatCategory = 2" href="#">都市</a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedChatCategory === 3 }" @click.prevent.stop="selectedChatCategory = 3" href="#">部隊</a></li>
            <li class="nav-item"><a :class="{ 'nav-link': true, 'active': selectedChatCategory === 4 }" @click.prevent.stop="selectedChatCategory = 4" href="#">登用</a></li> -->
          </ul>
          <div v-show="selectedChatCategory === 0 && selectedActionTab === 1" class="messages">
            <ChatMessagePanel :model="model.countryChat"
                              :countries="model.countries"
                              :countryColor="model.characterCountryColor"
                              :icons="model.characterIcons"
                              :canSendOtherCountry="model.canDiplomacy"
                              :myCharacterId="model.character.id"
                              :myCountryId="model.character.countryId"
                              :mutes="model.store.mutes"
                              :muteKeyword="model.store.muteKeyword"
                              :isIssueLink="true"
                              @chat-other-country="readyOtherCountryChatById($event)"
                              @call-focus="callCountryChatFocus = $event"
                              @chat-private="readyPrivateChatById($event)"
                              @open-image="openImage"
                              @issue-link="openIssueLink($event)"/>
          </div>
          <div v-show="selectedChatCategory === 1 && selectedActionTab === 1" class="messages">
            <ChatMessagePanel :model="model.privateChat"
                              :countries="model.countries"
                              :countryColor="model.characterCountryColor"
                              :icons="model.characterIcons"
                              canSendPrivate="true"
                              :myCharacterId="model.character.id"
                              :mutes="model.store.mutes"
                              :muteKeyword="model.store.muteKeyword"
                              :isIssueLink="true"
                              @chat-private="readyPrivateChatById($event)"
                              @call-focus="callPrivateChatFocus = $event"
                              @open-image="openImage"
                              @issue-link="openIssueLink($event)"/>
          </div>
          <div v-show="selectedChatCategory === 5 && selectedActionTab === 1" class="messages">
            <ChatMessagePanel :model="model.globalChat"
                              :countries="model.countries"
                              :countryColor="model.characterCountryColor"
                              :icons="model.characterIcons"
                              :myCharacterId="model.character.id"
                              :mutes="model.store.mutes"
                              :muteKeyword="model.store.muteKeyword"
                              :isIssueLink="true"
                              @chat-private="readyPrivateChatById($event)"
                              @open-image="openImage"
                              @issue-link="openIssueLink($event)"/>
          </div>
          <div v-show="selectedChatCategory === 6 && selectedActionTab === 1" class="messages">
            <ChatMessagePanel :model="model.global2Chat"
                              :countries="model.countries"
                              :countryColor="model.characterCountryColor"
                              :icons="model.characterIcons"
                              :myCharacterId="model.character.id"
                              :mutes="model.store.mutes"
                              :muteKeyword="model.store.muteKeyword"
                              :isIssueLink="true"
                              @chat-private="readyPrivateChatById($event)"
                              @open-image="openImage"
                              @issue-link="openIssueLink($event)"/>
          </div>
        </div>
        <!-- 会議室 -->
        <div v-show="selectedActionTab === 2" class="right-side-content content-meeting">
          <ThreadBbs :countries="model.countries" :threads="model.countryThreadBbs.threads" :bbsType="1" :characterId="model.character.id" :canRemoveAll="model.canRemoveAllCountryBbsItems" :mutes="model.store.mutes" :muteKeyword="model.store.muteKeyword"/>
        </div>
        <!-- 登用 -->
        <div v-show="selectedActionTab === 3 && selectedActionTabSubPanel === 0" class="right-side-content content-chat" style="display:flex;flex-direction:column">
          <div class="messages">
            <ChatMessagePanel :model="model.promotions"
                              :countries="model.countries"
                              :countryColor="model.characterCountryColor"
                              :icons="model.characterIcons"
                              :myCountryId="model.character.countryId"
                              :myCharacterId="model.character.id"
                              :mutes="model.store.mutes"
                              :muteKeyword="model.store.muteKeyword"
                              :canPost="false"
                              @chat-private="readyPrivateChatById($event)"/>
          </div>
        </div>
        <!-- 国設定 -->
        <div v-show="selectedActionTab === 3 && selectedActionTabSubPanel === 1 && model.canCountrySetting" class="right-side-content content-setting" style="display:flex;flex-direction:column">
          <div class="setting-list">
            <div v-if="model.store.systemData.isWaitingReset && model.canCountryUnifiedMessage" class="setting-row loading-container">
              <h3 :class="'country-color-' + model.characterCountryColor">統一国君主のあいさつ</h3>
              <div class="current-message">
                <h4>現在の設定</h4>
                <div :class="'current-message-content country-color-' + model.characterCountryColor">
                  <KmyChatTagText v-if="model.countryUnifiedMessage.message" :text="model.countryUnifiedMessage.message"/>
                  <span v-if="!model.countryUnifiedMessage.message" class="message-empty">なし</span>
                  <div v-else class="current-message-writer">
                    {{ model.countryUnifiedMessage.writerCharacterName }} ({{ model.getPostName(model.countryUnifiedMessage.writerPost) }})
                  </div>
                </div>
              </div>
              <textarea v-model="newCountryUnifiedMessage"></textarea>
              <div class="buttons">
                <button type="button" class="btn btn-light" @click="newCountryUnifiedMessage = model.countryUnifiedMessage.message">リセット</button>
                <button type="button" class="btn btn-primary" @click="model.updateCountryUnifiedMessage(newCountryUnifiedMessage)">承認</button>
              </div>
              <div v-show="model.isUpdatingCountrySettings" class="loading"><div class="loading-icon"></div></div>
            </div>
            <div v-if="model.canCountryCommander" class="setting-row loading-container">
              <h3 :class="'country-color-' + model.characterCountryColor">指令</h3>
              <div class="current-message" v-for="commander in model.sortedCountryCommanders" :key="commander.subject + '-' + commander.subjectData + '-' + commander.subjectData2">
                <h4 v-if="commander.subject === 1">全員</h4>
                <h4 v-else-if="commander.subject === 2">能力: {{ model.getCharacterTypeName(commander.subjectData) }}</h4>
                <h4 v-else-if="commander.subject === 3">出身: {{ commander.subjectData | charafromname }}</h4>
                <h4 v-else-if="commander.subject === 4 && model.getCharacter(commander.subjectData)">個人: {{ model.getCharacter(commander.subjectData).name }}</h4>
                <div :class="'current-message-content country-color-' + model.characterCountryColor" style="margin-bottom:8px">
                  <KmyChatTagText v-if="commander.message" :text="commander.message"/>
                  <span v-if="!commander.message" class="message-empty">なし</span>
                  <div v-else class="current-message-writer">
                    {{ commander.writerCharacterName }} ({{ model.getPostName(commander.writerPost) }})
                  </div>
                </div>
                <textarea v-model="commander.message" ref="commandersMessageInput" @input="commander.isEditing = true" style="height:80px"></textarea>
                <div class="buttons">
                  <button type="button" class="btn btn-danger" @click="model.updateCountryCommanderMessage('', commander.subject, commander.subjectData, commander.subjectData2)">削除</button>
                  <button type="button" class="btn btn-light" v-show="commander.isEditing" @click="commander.message = commander.oldMessage; commander.isEditing = false">戻す</button>
                  <button type="button" class="btn btn-primary" v-show="commander.isEditing" @click="model.updateCountryCommanderMessage(commander.message, commander.subject, commander.subjectData, commander.subjectData2)">保存</button>
                  <button type="button" class="btn btn-warning" @click="model.sendCountryCommanderMessageChat(commander.message, commander.subject, commander.subjectData, commander.subjectData2)">個宛</button>
                </div>
              </div>
              <div>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject !== 1, 'btn-secondary': newCountryCommanderSubject === 1, }" @click="newCountryCommanderSubject = 1; newCountryCommanderSubjectData = 0; characterFilterMode = 1; model.updateCountryCharactersFiltering(newCountryCommanderSubject, newCountryCommanderSubjectData, 0)">全員</button><br>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject !== 2 || newCountryCommanderSubjectData !== 1, 'btn-secondary': newCountryCommanderSubject === 2 && newCountryCommanderSubjectData === 1, }" @click="newCountryCommanderSubject = 2; newCountryCommanderSubjectData = 1; characterFilterMode = 1; model.updateCountryCharactersFiltering(newCountryCommanderSubject, newCountryCommanderSubjectData, 0)">武官</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject !== 2 || newCountryCommanderSubjectData !== 2, 'btn-secondary': newCountryCommanderSubject === 2 && newCountryCommanderSubjectData === 2, }" @click="newCountryCommanderSubject = 2; newCountryCommanderSubjectData = 2; characterFilterMode = 1; model.updateCountryCharactersFiltering(newCountryCommanderSubject, newCountryCommanderSubjectData, 0)">文官</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject !== 2 || newCountryCommanderSubjectData !== 3, 'btn-secondary': newCountryCommanderSubject === 2 && newCountryCommanderSubjectData === 3, }" @click="newCountryCommanderSubject = 2; newCountryCommanderSubjectData = 3; characterFilterMode = 1; model.updateCountryCharactersFiltering(newCountryCommanderSubject, newCountryCommanderSubjectData, 0)">仁官</button><br>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject !== 3 || newCountryCommanderSubjectData !== 1, 'btn-secondary': newCountryCommanderSubject === 3 && newCountryCommanderSubjectData === 1, }" @click="newCountryCommanderSubject = 3; newCountryCommanderSubjectData = 1; characterFilterMode = 1; model.updateCountryCharactersFiltering(newCountryCommanderSubject, newCountryCommanderSubjectData, 0)">武家</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject !== 3 || newCountryCommanderSubjectData !== 2, 'btn-secondary': newCountryCommanderSubject === 3 && newCountryCommanderSubjectData === 2, }" @click="newCountryCommanderSubject = 3; newCountryCommanderSubjectData = 2; characterFilterMode = 1; model.updateCountryCharactersFiltering(newCountryCommanderSubject, newCountryCommanderSubjectData, 0)">官吏</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject !== 3 || newCountryCommanderSubjectData !== 3, 'btn-secondary': newCountryCommanderSubject === 3 && newCountryCommanderSubjectData === 3, }" @click="newCountryCommanderSubject = 3; newCountryCommanderSubjectData = 3; characterFilterMode = 1; model.updateCountryCharactersFiltering(newCountryCommanderSubject, newCountryCommanderSubjectData, 0)">商人</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject !== 3 || newCountryCommanderSubjectData !== 4, 'btn-secondary': newCountryCommanderSubject === 3 && newCountryCommanderSubjectData === 4, }" @click="newCountryCommanderSubject = 3; newCountryCommanderSubjectData = 4; characterFilterMode = 1; model.updateCountryCharactersFiltering(newCountryCommanderSubject, newCountryCommanderSubjectData, 0)">技師</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject !== 3 || newCountryCommanderSubjectData !== 6, 'btn-secondary': newCountryCommanderSubject === 3 && newCountryCommanderSubjectData === 6, }" @click="newCountryCommanderSubject = 3; newCountryCommanderSubjectData = 6; characterFilterMode = 1; model.updateCountryCharactersFiltering(newCountryCommanderSubject, newCountryCommanderSubjectData, 0)">胡人</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject !== 3 || newCountryCommanderSubjectData !== 7, 'btn-secondary': newCountryCommanderSubject === 3 && newCountryCommanderSubjectData === 7, }" @click="newCountryCommanderSubject = 3; newCountryCommanderSubjectData = 7; characterFilterMode = 1; model.updateCountryCharactersFiltering(newCountryCommanderSubject, newCountryCommanderSubjectData, 0)">農家</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject !== 3 || newCountryCommanderSubjectData !== 8, 'btn-secondary': newCountryCommanderSubject === 3 && newCountryCommanderSubjectData === 8, }" @click="newCountryCommanderSubject = 3; newCountryCommanderSubjectData = 8; characterFilterMode = 1; model.updateCountryCharactersFiltering(newCountryCommanderSubject, newCountryCommanderSubjectData, 0)">兵家</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject !== 3 || newCountryCommanderSubjectData !== 9, 'btn-secondary': newCountryCommanderSubject === 3 && newCountryCommanderSubjectData === 9, }" @click="newCountryCommanderSubject = 3; newCountryCommanderSubjectData = 9; characterFilterMode = 1; model.updateCountryCharactersFiltering(newCountryCommanderSubject, newCountryCommanderSubjectData, 0)">学者</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject !== 3 || newCountryCommanderSubjectData !== 10, 'btn-secondary': newCountryCommanderSubject === 3 && newCountryCommanderSubjectData === 10, }" @click="newCountryCommanderSubject = 3; newCountryCommanderSubjectData = 10; characterFilterMode = 1; model.updateCountryCharactersFiltering(newCountryCommanderSubject, newCountryCommanderSubjectData, 0)">儒家</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject !== 3 || newCountryCommanderSubjectData !== 10, 'btn-secondary': newCountryCommanderSubject === 3 && newCountryCommanderSubjectData === 10, }" @click="newCountryCommanderSubject = 3; newCountryCommanderSubjectData = 10; characterFilterMode = 1; model.updateCountryCharactersFiltering(newCountryCommanderSubject, newCountryCommanderSubjectData, 0)">道家</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject !== 3 || newCountryCommanderSubjectData !== 10, 'btn-secondary': newCountryCommanderSubject === 3 && newCountryCommanderSubjectData === 10, }" @click="newCountryCommanderSubject = 3; newCountryCommanderSubjectData = 10; characterFilterMode = 1; model.updateCountryCharactersFiltering(newCountryCommanderSubject, newCountryCommanderSubjectData, 0)">仏僧</button><br>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject !== 4, 'btn-secondary': newCountryCommanderSubject === 4, }" @click="newCountryCommanderSubject = 4; newCountryCommanderSubjectData = 0; model.updateCountryCharacters(); isOpenCommanderTargetCharacterDialog = true; characterFilterMode = 0">個人</button>
                <span style="font-weight:bold" v-show="newCountryCommanderSubject === 4 && targetCharacter.id > 0">{{ targetCharacter.name }}</span>
              </div>
              <div class="buttons">
                <button type="button" class="btn btn-primary" @click="model.createEmptyCountryCommander(newCountryCommanderSubject, newCountryCommanderSubjectData || targetCharacter.id, newCountryCommanderSubjectData2)">追加</button>
              </div>
              <div class="loading-container" style="min-height:40px" v-show="characterFilterMode === 1">
                <MiniCharacterList
                  :countries="model.countries"
                  :characters="model.filteredCharacters"/>
                <div class="loading" v-show="model.isUpdatingCountryCharacters"><div class="loading-icon"></div></div>
              </div>
              <div v-show="model.isUpdatingCountrySettings" class="loading"><div class="loading-icon"></div></div>
            </div>
            <div v-if="model.canCountryCommander" class="setting-row loading-container">
              <h3 :class="'country-color-' + model.characterCountryColor">特殊な一斉個宛送信</h3>
              <textarea v-model="commanderPrivateMessage"></textarea>
              <div>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject2 !== 5, 'btn-secondary': newCountryCommanderSubject2 === 5, }" @click="newCountryCommanderSubject2 = 5; newCountryCommanderSubject2Data = 0; characterFilterMode = 2; model.updateCountryCharactersFiltering(newCountryCommanderSubject2, newCountryCommanderSubject2Data, 0)">援軍以外</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject2 !== 6, 'btn-secondary': newCountryCommanderSubject2 === 6, }" @click="newCountryCommanderSubject2 = 6; newCountryCommanderSubject2Data = 0; characterFilterMode = 2; model.updateCountryCharactersFiltering(newCountryCommanderSubject2, newCountryCommanderSubject2Data, 0)">派遣した援軍</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject2 !== 7, 'btn-secondary': newCountryCommanderSubject2 === 7, }" @click="newCountryCommanderSubject2 = 7; newCountryCommanderSubject2Data = 0; characterFilterMode = 2; model.updateCountryCharactersFiltering(newCountryCommanderSubject2, newCountryCommanderSubject2Data, 0)">両方</button><br>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject2 !== 8 || newCountryCommanderSubject2Data !== 15, 'btn-secondary': newCountryCommanderSubject2 === 8 && newCountryCommanderSubject2Data === 15, }" @click="newCountryCommanderSubject2 = 8; newCountryCommanderSubject2Data = 15; characterFilterMode = 2; model.updateCountryCharactersFiltering(newCountryCommanderSubject2, newCountryCommanderSubject2Data, 0)">ロール1</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject2 !== 8 || newCountryCommanderSubject2Data !== 16, 'btn-secondary': newCountryCommanderSubject2 === 8 && newCountryCommanderSubject2Data === 16, }" @click="newCountryCommanderSubject2 = 8; newCountryCommanderSubject2Data = 16; characterFilterMode = 2; model.updateCountryCharactersFiltering(newCountryCommanderSubject2, newCountryCommanderSubject2Data, 0)">2</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject2 !== 8 || newCountryCommanderSubject2Data !== 17, 'btn-secondary': newCountryCommanderSubject2 === 8 && newCountryCommanderSubject2Data === 17, }" @click="newCountryCommanderSubject2 = 8; newCountryCommanderSubject2Data = 17; characterFilterMode = 2; model.updateCountryCharactersFiltering(newCountryCommanderSubject2, newCountryCommanderSubject2Data, 0)">3</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject2 !== 8 || newCountryCommanderSubject2Data !== 18, 'btn-secondary': newCountryCommanderSubject2 === 8 && newCountryCommanderSubject2Data === 18, }" @click="newCountryCommanderSubject2 = 8; newCountryCommanderSubject2Data = 18; characterFilterMode = 2; model.updateCountryCharactersFiltering(newCountryCommanderSubject2, newCountryCommanderSubject2Data, 0)">4</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject2 !== 8 || newCountryCommanderSubject2Data !== 19, 'btn-secondary': newCountryCommanderSubject2 === 8 && newCountryCommanderSubject2Data === 19, }" @click="newCountryCommanderSubject2 = 8; newCountryCommanderSubject2Data = 19; characterFilterMode = 2; model.updateCountryCharactersFiltering(newCountryCommanderSubject2, newCountryCommanderSubject2Data, 0)">5</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject2 !== 8 || newCountryCommanderSubject2Data !== 20, 'btn-secondary': newCountryCommanderSubject2 === 8 && newCountryCommanderSubject2Data === 20, }" @click="newCountryCommanderSubject2 = 8; newCountryCommanderSubject2Data = 20; characterFilterMode = 2; model.updateCountryCharactersFiltering(newCountryCommanderSubject2, newCountryCommanderSubject2Data, 0)">6</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject2 !== 8 || newCountryCommanderSubject2Data !== 21, 'btn-secondary': newCountryCommanderSubject2 === 8 && newCountryCommanderSubject2Data === 21, }" @click="newCountryCommanderSubject2 = 8; newCountryCommanderSubject2Data = 21; characterFilterMode = 2; model.updateCountryCharactersFiltering(newCountryCommanderSubject2, newCountryCommanderSubject2Data, 0)">7</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject2 !== 8 || newCountryCommanderSubject2Data !== 22, 'btn-secondary': newCountryCommanderSubject2 === 8 && newCountryCommanderSubject2Data === 22, }" @click="newCountryCommanderSubject2 = 8; newCountryCommanderSubject2Data = 22; characterFilterMode = 2; model.updateCountryCharactersFiltering(newCountryCommanderSubject2, newCountryCommanderSubject2Data, 0)">8</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': newCountryCommanderSubject2 !== 8 || newCountryCommanderSubject2Data !== 23, 'btn-secondary': newCountryCommanderSubject2 === 8 && newCountryCommanderSubject2Data === 23, }" @click="newCountryCommanderSubject2 = 8; newCountryCommanderSubject2Data = 23; characterFilterMode = 2; model.updateCountryCharactersFiltering(newCountryCommanderSubject2, newCountryCommanderSubject2Data, 0)">9</button><br>
              </div>
              <div class="buttons">
                <button type="button" class="btn btn-light" @click="commanderPrivateMessage = ''">クリア</button>
                <button type="button" class="btn btn-warning" @click="model.sendCountryCommanderMessageChat(commanderPrivateMessage, newCountryCommanderSubject2, newCountryCommanderSubject2Data)">個宛</button>
              </div>
              <div class="loading-container" style="min-height:40px" v-show="characterFilterMode === 2">
                <MiniCharacterList
                  :countries="model.countries"
                  :characters="model.filteredCharacters"/>
                <div class="loading" v-show="model.isUpdatingCountryCharacters"><div class="loading-icon"></div></div>
              </div>
              <div v-show="model.isUpdatingCountrySettings" class="loading"><div class="loading-icon"></div></div>
            </div>
            <div v-if="model.canCountrySettingExceptForCommands" class="setting-row loading-container">
              <h3 :class="'country-color-' + model.characterCountryColor">新規登録者勧誘文</h3>
              <div class="current-message">
                <h4>現在のメッセージ</h4>
                <div :class="'current-message-content country-color-' + model.characterCountryColor">
                  <KmyChatTagText v-if="model.countrySolicitationMessage.message" :text="model.countrySolicitationMessage.message"/>
                  <span v-if="!model.countrySolicitationMessage.message" class="message-empty">なし</span>
                  <div v-else class="current-message-writer">
                    {{ model.countrySolicitationMessage.writerCharacterName }} ({{ model.getPostName(model.countrySolicitationMessage.writerPost) }})
                  </div>
                </div>
              </div>
              <textarea v-model="newCountrySolicitationMessage"></textarea>
              <div class="buttons">
                <button type="button" class="btn btn-light" @click="newCountrySolicitationMessage = model.countrySolicitationMessage.message">リセット</button>
                <button type="button" class="btn btn-primary" @click="model.updateCountrySolicitationMessage(newCountrySolicitationMessage)">承認</button>
              </div>
              <div v-show="model.isUpdatingCountrySettings" class="loading"><div class="loading-icon"></div></div>
            </div>
            <div v-if="model.canCountrySettingExceptForCommands && model.gameDate.year < 36" class="setting-row loading-container">
              <h3 :class="'country-color-' + model.characterCountryColor">玉璽受け入れ設定</h3>
              <div>
                <button type="button" :class="{'btn btn-toggle': true, 'selected': model.characterCountry.isGyokujiRefused}" @click="model.updateCountryGyokujiRefused(!model.characterCountry.isGyokujiRefused)">玉璽を拒否<span v-if="model.characterCountry.isGyokujiRefused">する</span><span v-else>しない</span></button>
              </div>
              <div v-show="model.isUpdatingCountrySettings" class="loading"><div class="loading-icon"></div></div>
            </div>
          </div>
        </div>
        <!-- 個人設定 -->
        <div v-show="selectedActionTab === 3 && selectedActionTabSubPanel === 5" class="right-side-content content-setting" style="display:flex;flex-direction:column">
          <div class="setting-list">
            <div class="setting-row loading-container">
              <h3 :class="'country-color-' + model.characterCountryColor">アイコン</h3>
              <div class="setting-section">
                <h4>メインアイコン</h4>
                <div>
                  <CharacterIcon :icons="model.characterIcons"/>
                </div>
              </div>
              <div class="setting-section">
                <h4>すべてのアイコン</h4>
                <div class="character-icon-selection">
                  <div :class="{ 'item': true, 'selected': icon.id === selectedIconAtPrivateConfig.id }"
                      v-for="icon in model.characterIcons"
                      :key="icon.id"
                      @click="selectedIconAtPrivateConfig = icon">
                    <CharacterIcon :icon="icon"/>
                    <div class="overlay"></div>
                  </div>
                  <div class="item item-new" @click="isOpenCharacterIconPickerDialog = true">
                    ＋
                    <div class="overlay"></div>
                  </div>
                </div>
              </div>
              <div class="buttons">
                <button type="button" class="btn btn-light" @click="model.setMainCharacterIcon(selectedIconAtPrivateConfig.id)">メインに設定</button>
                <button type="button" class="btn btn-light" @click="isShowIconOperations ^= true">操作</button>
                <button v-show="isShowIconOperations" type="button" class="btn btn-danger" @click="model.deleteCharacterIcon(selectedIconAtPrivateConfig.id)">削除</button>
              </div>
              <h3 :class="'country-color-' + model.characterCountryColor">メッセージ</h3>
              <div class="current-message">
                <h4>現在のメッセージ</h4>
                <div :class="'current-message-content country-color-' + model.characterCountryColor">
                  <KmyChatTagText v-if="model.character.message" :text="model.character.message" :isNewLine="false"/>
                  <span v-if="!model.character.message" class="message-empty">なし</span>
                </div>
              </div>
              <textarea v-model="newPrivateMessage"></textarea>
              <div class="buttons">
                <button type="button" class="btn btn-light" @click="newPrivateMessage = model.character.message">リセット</button>
                <button type="button" class="btn btn-primary" @click="model.updatePrivateMessage(newPrivateMessage)">承認</button>
              </div>
              <div v-show="model.isUpdatingPrivateSettings" class="loading"><div class="loading-icon"></div></div>
              <h3 :class="'country-color-' + model.characterCountryColor">ミュートするキーワード</h3>
              <div class="current-message">
                <h4>現在のキーワード</h4>
                <div :class="'current-message-content country-color-' + model.characterCountryColor">
                  <KmyChatTagText v-if="model.store.muteKeyword.keywords" :text="model.store.muteKeyword.keywords"/>
                  <span v-if="!model.store.muteKeyword.keywords" class="message-empty">なし</span>
                </div>
              </div>
              改行で区切って入力します
              <textarea v-model="newMuteKeywords"></textarea>
              <div class="buttons">
                <button type="button" class="btn btn-light" @click="newMuteKeywords = model.store.muteKeyword.keywords">リセット</button>
                <button type="button" class="btn btn-primary" @click="model.updateMuteKeywords(newMuteKeywords)">承認</button>
              </div>
              <div v-show="model.isUpdatingPrivateSettings" class="loading"><div class="loading-icon"></div></div>
            </div>
          </div>
        </div>
        <!-- 全国会議室 -->
        <div v-show="selectedActionTab === 3 && selectedActionTabSubPanel === 2" class="right-side-content content-meeting">
          <ThreadBbs :countries="model.countries" :threads="model.globalThreadBbs.threads" :bbsType="2" :characterId="model.character.id" :canRemoveAll="false" :mutes="model.store.mutes" :muteKeyword="model.store.muteKeyword"/>
        </div>
        <!-- 戦闘シミュレータ -->
        <div v-show="selectedActionTab === 3 && selectedActionTabSubPanel === 6" class="right-side-content content-soldier" style="display:flex;flex-direction:column">
          <BattleSimulatorView/>
        </div>
        <!-- 米施しシミュレータ -->
        <div v-show="selectedActionTab === 3 && selectedActionTabSubPanel === 7" class="right-side-content content-soldier" style="display:flex;flex-direction:column">
          <RiceSimulatorView/>
        </div>
        <!-- アカウント -->
        <div v-show="selectedActionTab === 3 && selectedActionTabSubPanel === 8" class="right-side-content content-setting" style="display:flex;flex-direction:column">
          <div class="setting-list">
            <div class="setting-row loading-container">
              <h3 :class="'country-color-' + model.characterCountryColor">アカウント</h3>
              <div class="alert alert-info">アカウントは、武将とは異なり、リセットされても情報を保持します。IDとパスワードの管理に注意してください。ログインすると、アカウント情報は武将に紐付けられます</div>
              <div v-if="model.store.account.id > 0" class="setting-section">
                <h4>現在のアカウント</h4>
                <div style="background:#dedede;padding:8px;margin-bottom:16px">
                  {{ model.store.account.name }} [{{ model.store.account.aliasId }}]
                </div>
                <div>
                  新しい名前<br><input type="text" style="width:60%" v-model="temporaryAccount.name"/><br>
                </div>
              </div>
              <div v-if="model.store.account.id > 0" class="buttons">
                <button type="button" class="btn btn-light" @click="model.updateAccount(temporaryAccount.name)">情報変更</button>
              </div>
              <div v-if="model.store.account.id <= 0" class="setting-section">
                <h4>ログイン</h4>
                <div>
                  ID<br><input type="text" style="width:60%" v-model="temporaryAccount.aliasId"/><br>
                  PASSWORD<br><input type="password" style="width:60%" v-model="temporaryAccount.password"/><br>
                </div>
              </div>
              <div v-if="model.store.account.id <= 0" class="buttons">
                <button type="button" class="btn btn-primary" @click="model.loginAccount(temporaryAccount.aliasId, temporaryAccount.password)">ログイン</button>
              </div>
              <div v-if="model.store.account.id <= 0" class="setting-section">
                <h4>新規作成</h4>
                <div>
                  名前<br><input type="text" style="width:60%" v-model="temporaryAccount.name"/><br>
                  ID<br><input type="text" style="width:60%" v-model="temporaryAccount.aliasId"/><br>
                  PASSWORD<br><input type="password" style="width:60%" v-model="temporaryAccount.password"/><br>
                </div>
              </div>
              <div v-if="model.store.account.id <= 0" class="buttons">
                <button type="button" class="btn btn-primary" @click="model.createAccount(temporaryAccount.aliasId, temporaryAccount.name, temporaryAccount.password)">新規作成</button>
              </div>
              <div v-show="model.isUpdatingAccount" class="loading"><div class="loading-icon"></div></div>
            </div>
          </div>
        </div>
        <!-- 専用BBS -->
        <div v-show="selectedActionTab === 3 && selectedActionTabSubPanel === 9" class="right-side-content content-setting" style="display:flex;flex-direction:column">
          <IssueBbs ref="bbs"
                    :isAdministrator="model.character.aiType === 28"
                    :account="model.store.account"
                    :mutes="model.store.mutes"
                    :onNewThreadReceived="model.issueBbsItemReceivedEventHandler"/>
        </div>
      </div>
    </div>
    <!-- ダイアログ -->
    <div id="status-dialog" :class="{ 'show': isOpenDialog }">
      <div class="dialog-background" @click="closeDialogs()"></div>
      <div v-show="isOpenImage" class="dialog-image" @click="isOpenImage = false">
        <img :src="imageUrl"/>
      </div>
      <!-- 徴兵 -->
      <div v-show="isOpenSoldierDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">徴兵</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/68.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content dialog-content-soldier">
          <div class="dialog-content-soldier-main">
            <div class="row">
              <div class="content-row col-6">
                <div class="label">統率</div><div class="value">{{ model.character.leadership }}</div>
              </div>
              <div class="content-row col-6">
                <div class="label">現在の兵数</div><div class="value">{{ model.character.soldierNumber }}</div>
              </div>
            </div>
            <div class="character-list">
              <SoldierTypePicker
                :soldierTypes="model.selectableSoldierTypes"
                :skills="model.characterSkills"
                :items="model.characterItems"
                :mode="soldierMode"
                v-model="selectedSoldierType"/>
            </div>
            <div class="soldier-input">
              <button type="button" :class="{'btn': true, 'btn-outline-secondary': selectedSoldierNumberType !== 0, 'btn-secondary': selectedSoldierNumberType === 0}" @click="setSelectedSoldierNumberType(0)">ALL</button>
              <button type="button" :class="{'btn': true, 'btn-outline-secondary': selectedSoldierNumberType !== 1, 'btn-secondary': selectedSoldierNumberType === 1}" @click="setSelectedSoldierNumberType(1)">1人</button>
              <!-- <button type="button" :class="{'btn': true, 'btn-outline-secondary': selectedSoldierNumberType !== 2, 'btn-secondary': selectedSoldierNumberType === 2}" @click="setSelectedSoldierNumberType(2)">9人</button> -->
              <button type="button" :class="{'btn': true, 'btn-outline-secondary': selectedSoldierNumberType !== 3, 'btn-secondary': selectedSoldierNumberType === 3}" @click="setSelectedSoldierNumberType(3)">末尾9</button>
              <input type="number" min="1" class="form-control" style="width:96px;text-align:center;display:inline;font-size:1.0em" v-model="soldierNumber" @input="selectedSoldierNumberType = 4">人徴兵
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenSoldierDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" @click="isOpenSoldierDialog = false; model.commands.inputer.inputSoldierCommand(10, selectedSoldierType.id, soldierNumber)">承認</button>
          </div>
        </div>
      </div>
      <!-- 登用 -->
      <div v-if="isOpenPromotionDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">登用</h2>
        <div class="dialog-content dialog-content-promotion loading-container">
          <div class="dialog-content-promotion-main">
            <div class="character-list">
              <SimpleCharacterList
                :countries="model.countries"
                :characters="model.oppositionCharacters"
                canSelect="true"
                v-model="promotionTarget"/>
            </div>
            <div class="promotion-input">
              登用文を入力してください...<br>
              <textarea v-model="promotionMessage"></textarea>
            </div>
          </div>
          <div class="loading" v-show="model.isUpdatingOppositionCharacters"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenPromotionDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="promotionTarget.id > 0 && promotionMessage !== ''" @click="model.commands.inputer.inputPromotionCommand(15, promotionTarget.id, promotionMessage); isOpenPromotionDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- 都市の滞在武将 -->
      <div v-show="isOpenTownCharactersDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.townCountryColor">{{ model.town.name }} の武将</h2>
        <div class="dialog-content loading-container">
          <div v-if="model.townCharacters.length === 0" class="alert alert-info">武将はいません</div>
          <SimpleCharacterList
            :countries="model.countries"
            :characters="model.townCharacters"
            :myCountryId="model.character.countryId"
            canPrivateChat="true"
            :myCharacterId="model.character.id"
            :commands="model.commands.commands"
            :otherCharacterCommands="model.store.otherCharacterCommands"
            isSortByTime="true"
            @private-chat="readyPrivateChat($event); isOpenTownCharactersDialog = false"/>
          <div class="loading" v-show="model.isUpdatingTownCharacters"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side"></div>
          <div class="right-side">
            <button class="btn btn-light" @click="isOpenTownCharactersDialog = false">閉じる</button>
          </div>
        </div>
      </div>
      <!-- 都市の守備武将 -->
      <div v-show="isOpenTownDefendersDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.townCountryColor">{{ model.town.name }} の守備</h2>
        <div class="dialog-content loading-container">
          <div v-if="model.townDefenders.length > 0" class="alert alert-info">次回の攻撃相手と対戦するのは <strong>{{ model.townDefenders[0].name }}</strong> です</div>
          <div v-else class="alert alert-info">守備はありません</div>
          <SimpleCharacterList
            :countries="model.countries"
            :characters="model.townDefenders"
            :myCountryId="model.character.countryId"
            canPrivateChat="true"
            :myCharacterId="model.character.id"
            :commands="model.commands.commands"
            :otherCharacterCommands="model.store.otherCharacterCommands"
            @private-chat="readyPrivateChat($event); isOpenTownDefendersDialog = false"/>
          <div class="loading" v-show="model.isUpdatingTownDefenders"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side"></div>
          <div class="right-side">
            <button class="btn btn-light" @click="isOpenTownDefendersDialog = false">閉じる</button>
          </div>
        </div>
      </div>
      <!-- 国の滞在武将 -->
      <div v-show="isOpenCountryCharactersDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.countryColor">{{ model.country.name }} の武将</h2>
        <div class="dialog-content loading-container">
          <div class="alert alert-warning">一部の情報は自動更新されません <button class="btn btn-secondary btn-sm" @click="model.updateCountryCharacters()">更新</button></div>
          <SimpleCharacterList
            :countries="model.countries"
            :characters="model.countryCharacters"
            :myCountryId="model.character.countryId"
            :myCharacterId="model.character.id"
            :canEdit="model.canAppoint"
            :canPunishment="model.canPunishment"
            :canReinforcement="model.canDiplomacy && (model.countryAllianceStatus.id === 3 || model.countryAllianceStatus.id === 6 || model.countryAllianceStatus.id === 106)"
            canPrivateChat="true"
            isSortByTime="true"
            @reinforcement-request="model.setReinforcementStatus($event, 1)"
            @reinforcement-cancel="model.setReinforcementStatus($event, 3)"
            @appoint="model.setCountryPost($event.characterId, $event.type)"
            @private-chat="readyPrivateChat($event); isOpenCountryCharactersDialog = false"
            @yesno="openYesno($event)"/>
          <div class="loading" v-show="model.isUpdatingCountryCharacters || model.isAppointing"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side"></div>
          <div class="right-side">
            <button class="btn btn-light" @click="isOpenCountryCharactersDialog = false">閉じる</button>
          </div>
        </div>
      </div>
      <!-- 無所属武将 -->
      <div v-if="isOpenOppositionCharactersDialog" class="dialog-body">
        <h2 class="dialog-title country-color-0">無所属 の武将</h2>
        <div class="dialog-content loading-container">
          <div class="alert alert-warning">情報は自動更新されません <button class="btn btn-secondary btn-sm" @click="model.updateOppositionCharacters()">更新</button></div>
          <SimpleCharacterList
            :countries="model.countries"
            :characters="model.oppositionCharacters"
            :myCountryId="model.character.countryId"
            :myCharacterId="model.character.id"
            canPrivateChat="true"
            @private-chat="readyPrivateChat($event); isOpenOppositionCharactersDialog = false"/>
          <div class="loading" v-show="model.isUpdatingOppositionCharacters"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side"></div>
          <div class="right-side">
            <button class="btn btn-light" @click="isOpenOppositionCharactersDialog = false">閉じる</button>
          </div>
        </div>
      </div>
      <!-- 政策 -->
      <div v-show="isOpenPoliciesDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">{{ model.country.name }} の政策</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/29.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content loading-container">
          <div style="display:flex;flex-direction:column;overflow:auto;height:100%">
            <CountryPolicyList :country="model.country"
                              :policies="model.countryPolicies"
                              :canEdit="model.country.id === model.character.countryId && model.canPolicy"
                              :isMyCountry="model.country.id === model.character.countryId"
                              v-model="selectedCountryPolicyType"
                              style="flex:1"/>
          </div>
          <div class="loading" v-show="model.isUpdatingPolicies"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" v-show="model.country.id === model.character.countryId && model.canPolicy" @click="isOpenPoliciesDialog = false">閉じる</button>
          </div>
          <div class="right-side">
            <button class="btn btn-light" v-show="model.country.id !== model.character.countryId || !model.canPolicy" @click="isOpenPoliciesDialog = false">閉じる</button>
            <button class="btn btn-primary" v-show="model.country.id === model.character.countryId && model.canPolicy && selectedCountryPolicyType.id > 0 && getPolicyPoint(selectedCountryPolicyType) <= model.country.policyPoint" @click="model.addPolicy(selectedCountryPolicyType.id)">承認</button>
          </div>
        </div>
      </div>
      <!-- 同盟 -->
      <div v-if="isOpenAllianceDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.townCountryColor">同盟：{{ model.country.name }}</h2>
        <div class="dialog-content" style="display:flex;flex-direction:column">
          <AllianceView :diplomacy="model.countryAlliance"
                        :changingValue="model.countryAllianceChangingValue"
                        :status="model.countryAllianceStatus"
                        :newData="model.newAllianceData"
                        :isSending="model.isSendingAlliance"
                        :canEdit="model.canDiplomacy"
                        :isShow="isOpenAllianceDialog"
                        style="flex:1"/>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" v-if="model.canDiplomacy" @click="isOpenAllianceDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-if="model.canDiplomacy" v-show="model.newAllianceData.status >= 0" @click="model.setAlliance(); isOpenAllianceDialog = false">承認</button>
            <button class="btn btn-light" v-if="!model.canDiplomacy" @click="isOpenAllianceDialog = false">閉じる</button>
          </div>
        </div>
      </div>
      <!-- 戦争 -->
      <div v-if="isOpenWarDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.townCountryColor">戦争：{{ model.country.name }}</h2>
        <div class="dialog-content" style="display:flex;flex-direction:column">
          <WarView :diplomacy="model.countryWar"
                   :status="model.countryWarStatus"
                   :newData="model.newWarData"
                   :isSending="model.isSendingWar"
                   :canEdit="model.canDiplomacy"
                   :isShow="isOpenWarDialog"
                   :system="model.systemData"
                   :myCountryId="model.character.countryId"
                   :targetCountryId="model.country.id"
                   style="flex:1"/>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" v-if="model.canDiplomacy" @click="isOpenWarDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-if="model.canDiplomacy" v-show="model.newWarData.status >= 0" @click="model.setWar(); isOpenWarDialog = false">承認</button>
            <button class="btn btn-light" v-if="!model.canDiplomacy" @click="isOpenWarDialog = false">閉じる</button>
          </div>
        </div>
      </div>
      <!-- 攻略 -->
      <div v-if="isOpenTownWarDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">攻略：{{ model.town.name }}</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/69.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content" style="display:flex;flex-direction:column">
          <TownWarView :current="model.gameDate"
                       :lastWar="model.characterCountryLastTownWar"
                       :status="model.characterCountryTownWarStatus"
                       :town="model.town"
                       :towns="model.store.towns"
                       :country="model.country"
                       :myCountryId="model.character.countryId"
                       :isSending="model.isSendingTownWar"
                       :canEdit="model.canDiplomacy"
                       :isShow="isOpenTownWarDialog"
                       :wars="model.store.wars"
                       @can-apply="canTownWar = $event"
                       style="flex:1"/>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" v-if="model.canDiplomacy" @click="isOpenTownWarDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-if="model.canDiplomacy" v-show="canTownWar" @click="model.setTownWar(); isOpenTownWarDialog = false">承認</button>
            <button class="btn btn-light" v-if="!model.canDiplomacy" @click="isOpenTownWarDialog = false">閉じる</button>
          </div>
        </div>
      </div>
      <!-- 部隊 -->
      <div v-if="isOpenUnitsDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">{{ model.characterCountry.name }} の部隊</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/83.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content" style="display:flex;flex-direction:column">
          <div class="alert alert-warning">情報は自動更新されません <button class="btn btn-secondary btn-sm" @click="model.unitModel.updateUnits()">更新</button></div>
          <UnitListView :model="model.unitModel"
                        :isShow="isOpenUnitsDialog"
                        style="flex:1"/>
        </div>
        <div class="dialog-footer">
          <div class="left-side"></div>
          <div class="right-side">
            <button class="btn btn-light" @click="isOpenUnitsDialog = false">閉じる</button>
          </div>
        </div>
      </div>
      <!-- 戦闘ログ -->
      <div v-show="isOpenBattleLogDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">戦闘ログ</h2>
        <div class="dialog-content loading-container">
          <BattleLogView :countries="model.countries" :logId="battleLogId" @loading="isLoadingBattleLog = true" @loaded="isLoadingBattleLog = false"/>
          <div class="loading" v-show="isLoadingBattleLog"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">ログID {{ battleLogId }}</div>
          <div class="right-side">
            <button class="btn btn-light" @click="isOpenBattleLogDialog = false">閉じる</button>
          </div>
        </div>
      </div>
      <!-- 指令 -->
      <div v-if="isOpenCommandersDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">{{ model.characterCountry.name }} 指令</h2>
        <div class="dialog-content dialog-content-directive">
          <div v-for="commander in model.sortedCountryCommanders" :key="commander.subject + '-' + commander.subjectData + '-' + commander.subjectData2">
            <h3 v-if="commander.subject === 1">全員</h3>
            <h3 v-else-if="commander.subject === 2">能力: {{ model.getCharacterTypeName(commander.subjectData) }}</h3>
            <h3 v-else-if="commander.subject === 3">出身: {{ commander.subjectData | charafromname }}</h3>
            <h3 v-else-if="commander.subject === 4 && model.getCharacter(commander.subjectData)">個人: {{ model.getCharacter(commander.subjectData).name }}</h3>
            <div :class="{ 'directive': true, 'active': commander.id === model.store.myCountryCommanderAll.id || commander.id === model.store.myCountryCommanderAttribute.id || commander.id === model.store.myCountryCommanderFrom.id || commander.id === model.store.myCountryCommanderPrivate.id, }">
              <div class="active-message">あなた向けの指令です</div>
              <div class="directive-main"><KmyChatTagText :text="commander.message"/></div>
              <div class="writer">
                {{ commander.writerCharacterName }} ({{ model.getPostName(commander.writerPost) }})
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <div class="left-side"></div>
          <div class="right-side">
            <button v-if="model.canCountrySetting" class="btn btn-primary" @click="readyEditCommanders()">編集</button>
            <button class="btn btn-light" @click="isOpenCommandersDialog = false">閉じる</button>
          </div>
        </div>
      </div>
      <!-- 指令対象武将選択 -->
      <div v-if="isOpenCommanderTargetCharacterDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">指令対象武将選択</div>
        </h2>
        <div class="dialog-content dialog-content-rice dialog-content-safe-out loading-container">
          <div class="content dialog-content-safe-out-main">
            <div class="character-list">
              <SimpleCharacterList
                :countries="model.countries"
                :characters="model.countryCharacters"
                canSelect="true"
                v-model="targetCharacter"/>
            </div>
          </div>
          <div class="loading" v-show="model.isUpdatingCountryCharacters"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button v-show="targetCharacter.id <= 0" class="btn btn-light" @click="isOpenCommanderTargetCharacterDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button v-show="targetCharacter.id > 0" class="btn btn-primary" @click="isOpenCommanderTargetCharacterDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- 米売買 -->
      <div v-if="isOpenRiceDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">米売買</h2>
        <div class="dialog-content dialog-content-rice">
          <div class="content">
            <div class="row">
              <div class="content-row col-lg-4">
                <div class="label">現在の相場</div><div class="value">{{ model.characterTownRiceTrend }}</div>
              </div>
              <div class="content-row col-lg-4 col-md-6">
                <div class="label">金{{ model.characterRiceBuyMax }} を交換した場合</div><div class="value">米 {{ model.characterTownMoneyToRicePrice(model.characterRiceBuyMax) }}</div>
              </div>
              <div class="content-row col-lg-4 col-md-6">
                <div class="label">米{{ model.characterRiceBuyMax }} を交換した場合</div><div class="value">金 {{ model.characterTownRiceToMoneyPrice(model.characterRiceBuyMax) }}</div>
              </div>
            </div>
            <div class="commands">
              <button type="button" :class="{ 'btn': true, 'btn-secondary': selectedRiceStatus === 1, 'btn-outline-secondary': selectedRiceStatus !== 1, }" @click="selectedRiceStatus = 1">金→米</button>
              <button type="button" :class="{ 'btn': true, 'btn-secondary': selectedRiceStatus === 2, 'btn-outline-secondary': selectedRiceStatus !== 2, }" @click="selectedRiceStatus = 2">米→金</button>
            </div>
            <div v-show="selectedRiceStatus === 1" class="command-parameters">
              <h3>金→米</h3>
              金 <input type="number" v-model.number="payRiceOrMoney"> → 米 <span class="result">{{ model.characterTownMoneyToRicePrice(payRiceOrMoney) }}</span>
            </div>
            <div v-show="selectedRiceStatus === 2" class="command-parameters">
              <h3>米→金</h3>
              米 <input type="number" v-model.number="payRiceOrMoney"> → 金 <span class="result">{{ model.characterTownRiceToMoneyPrice(payRiceOrMoney) }}</span>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenRiceDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button v-show="selectedRiceStatus !== 0 && payRiceOrMoney > 0 && payRiceOrMoney <= model.characterRiceBuyMax" class="btn btn-primary" @click="model.commands.inputer.inputRiceCommand(19, selectedRiceStatus, payRiceOrMoney); isOpenRiceDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- 国庫 -->
      <div v-if="isOpenSafeDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">国庫納入</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/54.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content dialog-content-rice">
          <div class="content">
            <div class="row">
              <div class="content-row col-sm-6">
                <div class="label">最大容量</div><div class="value">金 {{ model.safeMaxValue | commaformat }}</div>
              </div>
              <div class="content-row col-sm-6">
                <div class="label">現在の量</div><div class="value">金 {{ model.characterCountry.safeMoney | commaformat }}</div>
              </div>
            </div>
            <div class="command-parameters">
              金 <input type="number" v-model.number="paySafeMoney"> を納入
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenSafeDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button v-show="paySafeMoney > 0 && paySafeMoney <= 100000" class="btn btn-primary" @click="model.commands.inputer.inputSafeInCommand(34, paySafeMoney); isOpenSafeDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- 国庫搬出 -->
      <div v-if="isOpenSafeOutDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">国庫搬出</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/54.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content dialog-content-rice dialog-content-safe-out loading-container">
          <div class="content dialog-content-safe-out-main">
            <div class="row">
              <div class="content-row col-sm-6">
                <div class="label">最大容量</div><div class="value">金 {{ model.safeMaxValue | commaformat }}</div>
              </div>
              <div class="content-row col-sm-6">
                <div class="label">現在の量</div><div class="value">金 {{ model.characterCountry.safeMoney | commaformat }}</div>
              </div>
            </div>
            <div class="character-list">
              <SimpleCharacterList
                :countries="model.countries"
                :characters="model.countryCharacters"
                :isShowMoney="true"
                :isShowSoldier="false"
                canSelect="true"
                v-model="paySafeTarget"/>
            </div>
            <div class="command-parameters">
              金 <input type="number" v-model.number="paySafeMoney"> を搬出
            </div>
          </div>
          <div class="loading" v-show="model.isUpdatingCountryCharacters"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenSafeOutDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button v-show="paySafeMoney > 0 && paySafeMoney <= 100000" class="btn btn-primary" @click="model.commands.inputer.inputSafeOutCommand(35, paySafeTarget.id, paySafeMoney); isOpenSafeOutDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- 政務官募集 -->
      <div v-if="isOpenAddSecretaryDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">政務官募集</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/67.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content dialog-content-secretary-main">
          <div>
            <button :class="{ 'btn': true, 'btn-outline-secondary': selectedSecretaryType !== 8, 'btn-secondary': selectedSecretaryType === 8, }" @click="selectedSecretaryType = 8">仁官 (2)</button>
            <button :class="{ 'btn': true, 'btn-outline-secondary': selectedSecretaryType !== 9, 'btn-secondary': selectedSecretaryType === 9, }" @click="selectedSecretaryType = 9">集合官 (1)</button>
            <button :class="{ 'btn': true, 'btn-outline-secondary': selectedSecretaryType !== 11, 'btn-secondary': selectedSecretaryType === 11, }" @click="selectedSecretaryType = 11">農商官 (1)</button>
            <button :class="{ 'btn': true, 'btn-outline-secondary': selectedSecretaryType !== 32, 'btn-secondary': selectedSecretaryType === 32, }" @click="selectedSecretaryType = 32">伝道師 (1)</button>
            <button :class="{ 'btn': true, 'btn-outline-secondary': selectedSecretaryType !== 27, 'btn-secondary': selectedSecretaryType === 27, }" @click="selectedSecretaryType = 27" v-if="model.canSecretaryUnitLeader">部隊長 (1)</button>
            <button :class="{ 'btn': true, 'btn-outline-secondary': selectedSecretaryType !== 29, 'btn-secondary': selectedSecretaryType === 29, }" @click="selectedSecretaryType = 29" v-if="model.canSecretaryScouter">拙攻 (1)</button>
            <div class="alert alert-warning">政務官ポイントの上限は <strong>{{ model.secretaryMaxValue }}</strong>、うち現在使用しているポイントは <strong>{{ model.currentSecretaryPoint }}</strong> です<br>毎年1、7月に、国庫、なければ収入から代金 2000 を持っていきますので注意してください</div>
          </div>
          <div class="map" v-show="selectedSecretaryType !== 27">
            <Map
              :towns="model.towns"
              :countries="model.countries"
              :town="mapDialogSelectedTown"
              :currentTown="model.characterTown"
              :store="model.store"
              @selected="onMapDialogSelected($event)"
              style="height:400px;min-height:50vh"/>
          </div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenAddSecretaryDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="selectedSecretaryType > 0 && mapDialogSelectedTown.id > 0" @click="model.commands.inputer.inputSecretaryAddCommand(39, selectedSecretaryType, mapDialogSelectedTown.id); isOpenAddSecretaryDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- 政務官 -->
      <div v-if="isOpenSecretaryDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">政務官配属（部隊）</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/67.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content dialog-content-secretary loading-container">
          <div class="dialog-content-secretary-main">
            <div class="character-list">
              <SimpleCharacterList
                :countries="model.countries"
                :characters="model.countrySecretaries"
                canSelect="true"
                v-model="targetSecretary"/>
            </div>
            <div class="unit-list">
              <UnitPicker :units="model.unitModel.units"
                          :countries="model.countries"
                          :characters="model.countryCharacters"
                          :commands="model.commands"
                          :otherCharacterCommands="model.store.otherCharacterCommands"
                          v-model="targetUnit"/>
            </div>
          </div>
          <div class="loading" v-show="model.isUpdatingCountryCharacters || this.model.unitModel.isUpdating"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenSecretaryDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="targetSecretary.id > 0 && targetUnit.id > 0" @click="model.commands.inputer.inputSecretaryCommand(40, targetSecretary.id, targetUnit.id); isOpenSecretaryDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- 政務官 -->
      <div v-if="isOpenSecretaryTownDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">政務官配属（都市）</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/67.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content dialog-content-secretary loading-container">
          <div class="dialog-content-secretary-main">
            <div class="character-list-top-of-map">
              <SimpleCharacterList
                :countries="model.countries"
                :characters="model.countrySecretaries"
                :towns="model.store.towns"
                :isShowTown="true"
                canSelect="true"
                v-model="targetSecretary"/>
            </div>
            <div class="map">
              <Map
                :towns="model.towns"
                :countries="model.countries"
                :town="mapDialogSelectedTown"
                :currentTown="model.characterTown"
                :store="model.store"
                @selected="onMapDialogSelected($event)"
                style="height:400px;min-height:50vh"/>
            </div>
          </div>
          <div class="loading" v-show="model.isUpdatingCountryCharacters"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenSecretaryTownDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="targetSecretary.id > 0" @click="closeMapDialog(); isOpenSecretaryTownDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- 政務官解任 -->
      <div v-if="isOpenRemoveSecretaryDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">政務官解任</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/67.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content dialog-content-secretary loading-container">
          <div class="dialog-content-secretary-main">
            <div class="character-list">
              <SimpleCharacterList
                :countries="model.countries"
                :characters="model.countrySecretaries"
                canSelect="true"
                v-model="targetSecretary"/>
            </div>
            <div class="unit-list">
              <UnitPicker :units="model.unitModel.units"
                          :countries="model.countries"
                          :characters="model.countryCharacters"
                          :commands="model.commands"
                          :otherCharacterCommands="model.store.otherCharacterCommands"/>
            </div>
          </div>
          <div class="loading" v-show="model.isUpdatingCountryCharacters || this.model.unitModel.isUpdating"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenRemoveSecretaryDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="targetSecretary.id > 0" @click="model.commands.inputer.inputSecretaryRemoveCommand(41, targetSecretary.id); isOpenRemoveSecretaryDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- 別動隊 -->
      <div v-if="isOpenCustomizeFlyingColumnDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">別働隊指示</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/67.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content dialog-content-secretary loading-container">
          <div class="dialog-content-secretary-main">
            <div class="character-list-top-of-map" style="flex:0.6">
              <SimpleCharacterList
                :countries="model.countries"
                :characters="model.characterAiCharacters"
                canSelect="true"
                v-model="targetSecretary"/>
            </div>
            <div class="map" style="flex:1;overflow:auto">
              <div>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': flyingColumnAction !== 0, 'btn-secondary': flyingColumnAction === 0, }" @click="flyingColumnAction = 0">なし</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': flyingColumnAction !== 1, 'btn-secondary': flyingColumnAction === 1, }" @click="flyingColumnAction = 1">内政</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': flyingColumnAction !== 2, 'btn-secondary': flyingColumnAction === 2, }" @click="flyingColumnAction = 2">守備</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': flyingColumnAction !== 3, 'btn-secondary': flyingColumnAction === 3, }" @click="flyingColumnAction = 3">攻撃</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': flyingColumnAction !== 4, 'btn-secondary': flyingColumnAction === 4, }" @click="flyingColumnAction = 4">遊撃</button>
              </div>
              <div v-show="flyingColumnAction === 2 || flyingColumnAction === 3 || flyingColumnAction === 4">
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': flyingColumnSoldierType !== 0, 'btn-secondary': flyingColumnSoldierType === 0, }" @click="flyingColumnSoldierType = 0">最弱</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': flyingColumnSoldierType !== 1, 'btn-secondary': flyingColumnSoldierType === 1, }" @click="flyingColumnSoldierType = 1">戟兵</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': flyingColumnSoldierType !== 2, 'btn-secondary': flyingColumnSoldierType === 2, }" @click="flyingColumnSoldierType = 2">騎兵</button>
                <button type="button" :class="{ 'btn': true, 'btn-outline-secondary': flyingColumnSoldierType !== 3, 'btn-secondary': flyingColumnSoldierType === 3, }" @click="flyingColumnSoldierType = 3">弩兵</button>
              </div>
              <Map
                v-show="flyingColumnAction === 1 || flyingColumnAction === 2 || flyingColumnAction === 3 || flyingColumnAction === 4"
                :towns="model.towns"
                :countries="model.countries"
                :town="mapDialogSelectedTown"
                :currentTown="model.characterTown"
                :store="model.store"
                @selected="onMapDialogSelected($event)"
                style="height:400px;min-height:50vh"/>
            </div>
          </div>
          <div class="loading" v-show="model.isUpdatingCountryCharacters"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenCustomizeFlyingColumnDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="targetSecretary.id > 0" @click="closeMapDialog(); isOpenCustomizeFlyingColumnDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- 別動隊削除 -->
      <div v-if="isOpenRemoveFlyingColumnDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">別働隊削除</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/67.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content dialog-content-secretary loading-container">
          <div class="dialog-content-secretary-main">
            <div class="character-list">
              <SimpleCharacterList
                :countries="model.countries"
                :characters="model.characterAiCharacters"
                canSelect="true"
                v-model="targetSecretary"/>
            </div>
          </div>
          <div class="loading" v-show="model.isUpdatingCountryCharacters || this.model.unitModel.isUpdating"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenRemoveFlyingColumnDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="targetSecretary.id > 0" @click="model.commands.inputer.inputSecretaryRemoveCommand(68, targetSecretary.id); isOpenRemoveFlyingColumnDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- 武将アイコン追加 -->
      <div v-if="isOpenCharacterIconPickerDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">新規アイコン追加</h2>
        <div class="dialog-content">
          <CharacterIconPicker v-model="newIcon" :canUseFile="true"/>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenCharacterIconPickerDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" @click="isOpenCharacterIconPickerDialog = false; model.addCharacterIcon(newIcon); resetNewIcon()">承認</button>
          </div>
        </div>
      </div>
      <!-- 陣形 -->
      <div v-if="isOpenFormationDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">陣形</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/50.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content loading-container" style="display:flex;flex-direction:column">
          <FormationList :currentFormationType="model.character.formationType"
                         :formations="model.formations"
                         :canAddSelect="false"
                         :canAdd="false"
                         v-model="selectedFormationType"
                         style="flex:1"/>
          <div class="loading" v-show="model.isUpdatingFormations"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenFormationDialog = false">閉じる</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="selectedFormationType.id >= 0 && selectedFormationType.id !== model.character.formationType" @click="model.changeFormation(selectedFormationType.id)">承認</button>
          </div>
        </div>
      </div>
      <!-- 陣形追加 -->
      <div v-if="isOpenFormationAddDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">陣形追加</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/50.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content" style="display:flex;flex-direction:column">
          <FormationList :currentFormationType="model.character.formationType"
                         :formations="model.formations"
                         :canChange="false"
                         :skills="model.store.skills"
                         v-model="selectedFormationType"
                         style="flex:1"/>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenFormationAddDialog = false">閉じる</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="selectedFormationType.id >= 0 && selectedFormationType.id !== model.character.formationType" @click="model.commands.inputer.inputFormationCommand(48, selectedFormationType.id); isOpenFormationAddDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- 陣形変更 -->
      <div v-if="isOpenFormationChangeDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">陣形変更</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/50.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content" style="display:flex;flex-direction:column">
          <FormationList :currentFormationType="model.character.formationType"
                         :formations="model.formations"
                         :canAdd="false"
                         :isShowChangePoint="false"
                         v-model="selectedFormationType"
                         style="flex:1"/>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenFormationChangeDialog = false">閉じる</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="selectedFormationType.id >= 0" @click="model.commands.inputer.inputFormationCommand(49, selectedFormationType.id); isOpenFormationChangeDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- アイテム一覧 -->
      <div v-show="isOpenCharacterItemDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">アイテム</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/12.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content loading-container" style="display:flex;flex-direction:column">
          <CharacterItemList :items="model.characterItems"
                             :skills="model.characterSkills"
                              v-model="selectedCharacterItemType"
                              isShowPendings="true"
                              canEditPending="true"
                              style="flex:1"/>
          <div class="loading" v-show="model.isUpdatingItems"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenCharacterItemDialog = false">閉じる</button>
            <button class="btn btn-danger" v-show="selectedCharacterItemType.type.id >= 0" @click="model.addCharacterItem(selectedCharacterItemType.type.id, selectedCharacterItemType.id, 1, true)">拒否</button>
          </div>
          <div class="right-side">
            <button class="btn btn-secondary" v-show="model.hasPendingItems" @click="model.receiveAllItems()">一括受取</button>
            <button class="btn btn-primary" v-show="selectedCharacterItemType.type.id >= 0" @click="model.addCharacterItem(selectedCharacterItemType.type.id, selectedCharacterItemType.id, 3, true)">承認</button>
          </div>
        </div>
      </div>
      <!-- アイテム購入 -->
      <div v-if="isOpenCharacterItemBuyDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">アイテム購入</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/12.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content" style="display:flex;flex-direction:column">
          <div class="alert alert-warning">次に都市ごとのアイテムがシャッフルされるのは <span style="font-weight:bold">{{ model.nextItemShuffleYear }}</span> 年 1 月 です。先行入力のときはこれを超えないよう注意してください</div>
          <CharacterItemList :items="model.characterTownItems"
                             :skills="model.characterSkills"
                              canEdit="true"
                              isBuy="true"
                              v-model="selectedCharacterItemType"
                              style="flex:1"/>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenCharacterItemBuyDialog = false">閉じる</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="selectedCharacterItemType.type.id >= 0" @click="model.commands.inputer.inputItemCommand(50, selectedCharacterItemType.type.id, 0); isOpenCharacterItemBuyDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- アイテム売却 -->
      <div v-if="isOpenCharacterItemSellDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">アイテム売却</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/12.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content" style="display:flex;flex-direction:column">
          <CharacterItemList :items="model.characterItems"
                             :skills="model.characterSkills"
                              canEdit="true"
                              isSell="true"
                              isShowPendings="true"
                              canEditPending="true"
                              v-model="selectedCharacterItemType"
                              style="flex:1"/>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenCharacterItemSellDialog = false">閉じる</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="selectedCharacterItemType.type.id >= 0" @click="model.commands.inputer.inputItemCommand(51, selectedCharacterItemType.type.id, 0); isOpenCharacterItemSellDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- アイテム譲渡 -->
      <div v-if="isOpenCharacterItemHandOverDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">アイテム譲渡</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/12.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content dialog-content-secretary loading-container">
          <div class="dialog-content-secretary-main">
            <div class="character-list">
              <SimpleCharacterList
                :countries="model.countries"
                :characters="model.countryCharacters"
                canSelect="true"
                v-model="targetCharacter"/>
            </div>
            <div class="item-list">
              <CharacterItemList :items="model.characterItems"
                                 :skills="model.characterSkills"
                                 canEdit="true"
                                 isHandOver="true"
                                 isShowPendings="true"
                                 canEditPending="true"
                                 v-model="selectedCharacterItemType"/>
            </div>
          </div>
          <div class="loading" v-show="model.isUpdatingCountryCharacters"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenCharacterItemHandOverDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="targetCharacter.id > 0 && selectedCharacterItemType.type.id > 0" @click="model.commands.inputer.inputHandOverItemCommand(52, selectedCharacterItemType.type.id, 0, targetCharacter.id); isOpenCharacterItemHandOverDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- アイテム使用 -->
      <div v-if="isOpenCharacterItemUseDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">アイテム使用</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/12.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content" style="display:flex;flex-direction:column">
          <CharacterItemList :items="model.characterItems"
                             :skills="model.characterSkills"
                              canEdit="true"
                              isUse="true"
                              isShowPendings="true"
                              canEditPending="true"
                              v-model="selectedCharacterItemType"
                              style="flex:1"/>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenCharacterItemUseDialog = false">閉じる</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="selectedCharacterItemType.type.id >= 0" @click="model.commands.inputer.inputItemCommand(56, selectedCharacterItemType.type.id, 0); isOpenCharacterItemUseDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- アイテム生成 -->
      <div v-if="isOpenGenerateItemUseDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">アイテム生産</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/82.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content" style="display:flex;flex-direction:column">
          <GenerateItemTypePicker :skills="model.characterSkills"
                                  v-model="selectedGenerateItemType"
                                  style="flex:1"/>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenGenerateItemUseDialog = false">閉じる</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="selectedGenerateItemType.id >= 0" @click="model.commands.inputer.inputGenerateItemCommand(57, selectedGenerateItemType.id); isOpenGenerateItemUseDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- 技能 -->
      <div v-if="isOpenSkillDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">技能</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/19.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content loading-container" style="display:flex;flex-direction:column">
            <SkillList :skills="model.characterSkills"
                       :skillPoint="model.character.skillPoint"
                       v-model="selectedSkillType"
                       style="flex:1"/>
          <div class="loading" v-show="model.isUpdatingSkills"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenSkillDialog = false">閉じる</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="selectedSkillType.id >= 0 && selectedSkillType.point <= model.character.skillPoint" @click="model.addSkill(selectedSkillType.id)">承認</button>
          </div>
        </div>
      </div>
      <!-- コマンドコメント -->
      <div v-if="isOpenCommandCommentDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">コメント</h2>
        <div class="dialog-content dialog-content-promotion">
          <div class="dialog-content-promotion-main">
            <div class="comment-input">
              コメントを入力してください...<br>
              <input v-model="commandCommentMessage" style="width:100%">
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenCommandCommentDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" @click="model.commands.inputer.setCommandComments(commandCommentMessage); isOpenCommandCommentDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- 建築物建築 -->
      <div v-if="isOpenBuildTownSubBuildingDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">建築物の建築</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/104.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content" style="display:flex;flex-direction:column">
          <TownSubBuildingList v-model="selectedTownSubBuilding"
                               :store="model.store"
                               :isShowAll="false"
                               style="flex:1"/>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenBuildTownSubBuildingDialog = false">閉じる</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="selectedTownSubBuilding.id >= 0" @click="model.commands.inputer.inputTownSubBuildingCommand(63, selectedTownSubBuilding.id); isOpenBuildTownSubBuildingDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- 建築物撤去 -->
      <div v-if="isOpenRemoveTownSubBuildingDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">建築物の撤去</div>
          <div class="help"><a class="btn btn-sm btn-info" href="https://w.atwiki.jp/sangokukmy9/pages/104.html" target="_blank">？</a></div>
        </h2>
        <div class="dialog-content" style="display:flex;flex-direction:column">
          <TownSubBuildingList v-model="selectedTownSubBuilding"
                               style="flex:1"/>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenRemoveTownSubBuildingDialog = false">閉じる</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="selectedTownSubBuilding.id >= 0" @click="model.commands.inputer.inputTownSubBuildingCommand(64, selectedTownSubBuilding.id); isOpenRemoveTownSubBuildingDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- 地図での都市選択 -->
      <div v-show="isOpenMapDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">都市選択</h2>
        <div class="dialog-content dialog-content-promotion">
          <div class="dialog-content-promotion-main">
            <Map
              :towns="model.towns"
              :countries="model.countries"
              :town="mapDialogSelectedTown"
              :currentTown="model.characterTown"
              :store="model.store"
              @selected="onMapDialogSelected($event)"
              style="height:400px;min-height:50vh"/>
            <div v-if="mapDialogMode === 0 || mapDialogMode === 1">
              <div class="alert alert-warning">
                所在都市のタテ・ヨコ・ナナメに隣接する都市に移動または侵攻できます。部隊に入っている場合は注意してください
              </div>
            </div>
            <div v-if="mapDialogMode === 6">
              <div class="alert alert-warning">
                割譲先と隣接した都市しか割譲できません<br>
                AI国家に割譲することはできません<br>
                <strong>すべての都市を割譲すると降伏になります</strong><br>
              </div>
              <div class="alert alert-info">
                割譲先: <strong>{{ model.country.name }}</strong>
              </div>
              <div class="alert alert-danger" v-show="mapDialogSelectedTown.countryId !== model.characterCountry.id">
                自分の国の都市ではありません
              </div>
              <div class="alert alert-danger" v-show="!model.isNextToCountry(mapDialogSelectedTown.id, model.country.id)">
                割譲先と隣接していません
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenMapDialog = false">キャンセル</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" @click="closeMapDialog(); isOpenMapDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- キュー -->
      <div v-if="isOpenQueueDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">キュー</div>
        </h2>
        <div class="dialog-content loading-container" style="display:flex;flex-direction:column">
          <QueueList :delayEffects="model.store.delayEffects"
                     :towns="model.towns"
                     v-model="selectedDelayEffect"
                              style="flex:1"/>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenQueueDialog = false">閉じる</button>
          </div>
          <div class="right-side" v-if="false">
            <button class="btn btn-primary" v-show="selectedDelayEffect.id >= 0" @click="isOpenQueueDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- 都市建設 -->
      <div v-if="isOpenCreateTownDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">都市建設</div>
        </h2>
        <div class="dialog-content loading-container">
          <div>
            <div class="alert alert-warning">
              都市建設には <strong>200 0000</strong> の金が必要です
            </div>
          </div>
          <h3>方向</h3>
          <div>
            <button type="button" :class="{'btn': true, 'btn-outline-secondary': selectedDirection !== 1, 'btn-secondary': selectedDirection === 1}" @click="selectedDirection = 1">左上</button>
            <button type="button" :class="{'btn': true, 'btn-outline-secondary': selectedDirection !== 2, 'btn-secondary': selectedDirection === 2}" @click="selectedDirection = 2">上</button>
            <button type="button" :class="{'btn': true, 'btn-outline-secondary': selectedDirection !== 3, 'btn-secondary': selectedDirection === 3}" @click="selectedDirection = 3">右上</button>
            <button type="button" :class="{'btn': true, 'btn-outline-secondary': selectedDirection !== 4, 'btn-secondary': selectedDirection === 4}" @click="selectedDirection = 4">左</button>
            <button type="button" :class="{'btn': true, 'btn-outline-secondary': selectedDirection !== 5, 'btn-secondary': selectedDirection === 5}" @click="selectedDirection = 5">右</button>
            <button type="button" :class="{'btn': true, 'btn-outline-secondary': selectedDirection !== 6, 'btn-secondary': selectedDirection === 6}" @click="selectedDirection = 6">左下</button>
            <button type="button" :class="{'btn': true, 'btn-outline-secondary': selectedDirection !== 7, 'btn-secondary': selectedDirection === 7}" @click="selectedDirection = 7">下</button>
            <button type="button" :class="{'btn': true, 'btn-outline-secondary': selectedDirection !== 8, 'btn-secondary': selectedDirection === 8}" @click="selectedDirection = 8">右下</button>
          </div>
          <h3>特化</h3>
          <div>
            <button type="button" :class="{'btn': true, 'btn-outline-secondary': selectedTownType !== 1, 'btn-secondary': selectedTownType === 1}" @click="selectedTownType = 1">農業都市</button>
            <button type="button" :class="{'btn': true, 'btn-outline-secondary': selectedTownType !== 2, 'btn-secondary': selectedTownType === 2}" @click="selectedTownType = 2">商業都市</button>
            <button type="button" :class="{'btn': true, 'btn-outline-secondary': selectedTownType !== 3, 'btn-secondary': selectedTownType === 3}" @click="selectedTownType = 3">城塞都市</button>
          </div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenCreateTownDialog = false">閉じる</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="selectedDirection > 0 && selectedTownType > 0" @click="model.commands.inputer.inputCreateTownCommand(70, selectedDirection, selectedTownType); isOpenCreateTownDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- 都市購入 -->
      <div v-if="isOpenBuyTownDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">
          <div class="header">都市購入</div>
        </h2>
        <div class="dialog-content loading-container">
          <div v-show="model.town.countryId === model.character.countryId">
            <h3>各国が購入に必要な政策ポイント</h3>
            <div style="margin: 16px 16px 32px">
              <div v-for="data in model.townBuyCosts" :key="data.country.id">
                {{ data.country.name }} - <strong>{{ data.cost }}</strong>
              </div>
            </div>
            <div v-show="model.canPolicy">
              <h3>防衛投資</h3>
              <div class="alert alert-info">以下のボタンを押すと、政策ポイント 1000 を消費して、購入に必要な政策ポイントを加算します</div>
              <button type="button" class="btn btn-secondary" @click="model.addBuyTownCost()">加算</button>
            </div>
          </div>
          <div v-show="model.town.countryId !== model.character.countryId">
            <h4>購入に必要な政策ポイント: <strong>{{ model.townBuyCost }}</strong></h4>
            <h4>現在の政策ポイント: {{ model.characterCountry.policyPoint }}</h4>
            <div class="alert alert-danger" v-show="model.townBuyCost > model.characterCountry.policyPoint">購入に必要な政策ポイントが足りません</div>
            <div class="alert alert-danger" v-show="!model.town.countryId">無所属都市は購入できません</div>
            <div class="alert alert-danger" v-show="model.gameDate.year < 48">48 年より前は購入できません</div>
            <div class="alert alert-info" v-show="model.townBuyCost <= model.characterCountry.policyPoint">都市を購入可能です</div>
          </div>
          <div class="alert alert-info">
            都市購入の費用は、おもに以下によって変動します。<br>
            ・購入を行う国の都市数、武将数<br>
            ・自国と相手国が戦争または同盟を結んでいるか<br>
            ・自国と相手国との国教が異なり、都市の宗教が国教と同じか<br>
          </div>
          <div class="loading" v-show="model.isUpdatingTownBuyCost"><div class="loading-icon"></div></div>
        </div>
        <div class="dialog-footer">
          <div class="left-side">
            <button class="btn btn-light" @click="isOpenBuyTownDialog = false">閉じる</button>
          </div>
          <div class="right-side">
            <button class="btn btn-primary" v-show="!model.isUpdatingTownBuyCost && model.town.countryId && model.canPolicy && model.gameDate.year >= 48 && model.characterCountry.policyPoint >= model.townBuyCost" @click="model.buyTown(); isOpenBuyTownDialog = false">承認</button>
          </div>
        </div>
      </div>
      <!-- ようこそ -->
      <div v-if="isOpenWelcomeDialog" class="dialog-body">
        <h2 :class="'dialog-title country-color-' + model.characterCountryColor">ようこそ</h2>
        <div class="dialog-content dialog-content-welcome">
          <div v-if="!isApp" class="dialog-content-welcome-main">
            <h3>三国志NETは初めてですか？</h3>
            <a href="https://w.atwiki.jp/sangokukmy9/pages/105.html" target="_blank" class="btn btn-primary" style="margin-left:8px">スライド解説</a>
            <a href="https://w.atwiki.jp/sangokukmy9/pages/77.html" target="_blank" class="btn btn-light">初心者向け解説</a>
            <div class="alert alert-info" style="margin-top:16px">
              初心者向け解説は、このダイアログを閉じた後も、いつでも「メニュー」から表示することができます。<br>
              スライド解説は、初心者向け解説ページから移動することができます。<br>
              このダイアログは、「承認」をクリックまたはタップすることで、閉じることができます。
            </div>
            <h3>三国志NETは経験者で、KMY Versionは初めてですか？</h3>
            <a href="https://w.atwiki.jp/sangokukmy9/pages/105.html" target="_blank" class="btn btn-primary" style="margin-left:8px">スライド解説</a>
            <a href="https://w.atwiki.jp/sangokukmy9/pages/45.html" target="_blank" class="btn btn-secondary">画面の見方</a>
            <a href="https://w.atwiki.jp/sangokukmy9/pages/81.html" target="_blank" class="btn btn-light" style="margin-left:8px">他の三国志NETとの違い</a>
            <div style="margin-top:16px">
              画面は他の三国志NETと大きく異なりますが、ゲームシステムは三国志NETを踏襲したものです。<br>
              他にも、<a href="https://w.atwiki.jp/sangokukmy9/pages/19.html" target="_blank">出身</a>、<a href="https://w.atwiki.jp/sangokukmy9/pages/50.html" target="_blank">陣形</a>などの特徴的な要素があります。
            </div>
            <h3>コマンドを入力しましょう</h3>
            三国志NET KMY Versionは、コマンドを入力して進行します。<br>
            長時間コマンドを入力していないと、自動で削除されます。ゲームを続けるためには、毎日のログインが必要になります。
            <h3>みんなの輪に入りましょう</h3>
            「手紙」→「全国」から、みんなに挨拶しましょう。<br>
            わからないことを質問したり、雑談したりして楽しみましょう。
          </div>
          <div v-else class="dialog-content-welcome-main">
            <h3>三国志NETは初めてですか？</h3>
            初心者向けの解説は、「情報」タブからいつでも確認することができます。ぜひ見てみましょう！
            <h3>コマンドを入力しましょう</h3>
            三国志NET KMY Versionは、コマンドを入力して進行します。<br>
            長時間コマンドを入力していないと、自動で削除されます。ゲームを続けるためには、毎日のログインが必要になります。
            <h3>みんなの輪に入りましょう</h3>
            「手紙」→「全国」から、みんなに挨拶しましょう。<br>
            わからないことを質問したり、雑談したりして楽しみましょう。
          </div>
        </div>
        <div class="dialog-footer">
          <div class="left-side"></div>
          <div class="right-side">
            <button class="btn btn-primary" @click="isOpenWelcomeDialog = false">承認</button>
          </div>
        </div>
      </div>
    </div>
    <div id="status-yesno" v-if="isYesno">
      <div class="yesno-background" @click="isYesno = false"></div>
      <div class="yesno-dialog">
        <div class="message">{{ yesnoMessage }}</div>
        <div class="commands">
          <button class="btn btn-light" @click="isYesno = false">いいえ</button>
          <button class="btn btn-primary" @click="isYesno = false; yesnoEvent()">はい</button>
        </div>
      </div>
    </div>
    <div v-if="!model.store.hasInitialized" class="loading">
      <div class="loading-icon"></div>
      <div v-if="isApp" class="alert alert-warning" style="position:fixed;bottom:10vh;left:10vw;width:80vw;text-align:center">
        情報を更新中です。しばらくお待ち下さい...<br>
        <span v-show="model.isLoadingTooLong">この画面が長時間表示され続ける場合は、サーバーが落ちている可能性があります。時間をおいて再度お試しください</span>
        <div style="margin-top:12px"><button v-if="isApp" class="btn btn-secondary" @click="reloadPage()">再読み込み</button></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import Map from '@/components/parts/Map.vue';
import CharacterIcon from '@/components/parts/CharacterIcon.vue';
import StatusParametersPanel from '@/components/parts/StatusParameters.vue';
import ChatMessagePanel from '@/components/parts/ChatMessagePanel.vue';
import MapLogList from '@/components/parts/MapLogList.vue';
import TownList from '@/components/parts/TownList.vue';
import SimpleCharacterList from '@/components/parts/SimpleCharacterList.vue';
import MiniCharacterList from '@/components/parts/MiniCharacterList.vue';
import GameDateTimePicker from '@/components/parts/GameDateTimePicker.vue';
import SoldierTypePicker from '@/components/parts/SoldierTypePicker.vue';
import UnitPicker from '@/components/parts/UnitPicker.vue';
import CharacterIconPicker from '@/components/parts/CharacterIconPicker.vue';
import BattleLogView from '@/components/parts/BattleLogView.vue';
import ThreadBbs from '@/components/parts/ThreadBbs.vue';
import IssueBbs from '@/components/parts/IssueBbs.vue';
import CommandListView from '@/components/parts/status/CommandList.vue';
import AllianceView from '@/components/parts/status/AllianceView.vue';
import WarView from '@/components/parts/status/WarView.vue';
import TownWarView from '@/components/parts/status/TownWarView.vue';
import UnitListView from '@/components/parts/status/UnitView.vue';
import CountryPolicyList from '@/components/parts/CountryPolicyList.vue';
import FormationList from '@/components/parts/FormationList.vue';
import SkillList from '@/components/parts/SkillList.vue';
import QueueList from '@/components/parts/QueueList.vue';
import TownSubBuildingList from '@/components/parts/TownSubBuildingList.vue';
import CharacterItemList from '@/components/parts/CharacterItemList.vue';
import GenerateItemTypePicker from '@/components/parts/GenerateItemTypePicker.vue';
import BattleSimulatorView from '@/components/parts/status/BattleSimulatorView.vue';
import RiceSimulatorView from '@/components/parts/status/RiceSimulatorView.vue';
import KmyChatTagText from '@/components/parts/KmyChatTagText.vue';
import * as api from '@/api/api';
import * as def from '@/common/definitions';
import StatusModel from '@/models/status/statusmodel';
import { StatusParameter } from '@/models/status/statusparameter';
import ChatMessageContainer, { IChatMessageContainer } from '@/models/status/chatmessagecontainer';
import Enumerable from 'linq';
import EventObject from '@/models/common/EventObject';

@Component({
  components: {
    Map,
    CharacterIcon,
    StatusParametersPanel,
    ChatMessagePanel,
    MapLogList,
    TownList,
    SimpleCharacterList,
    MiniCharacterList,
    GameDateTimePicker,
    UnitPicker,
    CharacterIconPicker,
    SoldierTypePicker,
    BattleLogView,
    ThreadBbs,
    IssueBbs,
    CommandListView,
    AllianceView,
    WarView,
    TownWarView,
    UnitListView,
    KmyChatTagText,
    BattleSimulatorView,
    CountryPolicyList,
    FormationList,
    CharacterItemList,
    GenerateItemTypePicker,
    SkillList,
    QueueList,
    TownSubBuildingList,
    RiceSimulatorView,
  },
})
export default class StatusPage extends Vue {
  public model: StatusModel = new StatusModel();
  public isApp: boolean = false;
  public isOpenRightSidePopupMenu: boolean = false;
  public isOpenSoliderDropdown: boolean = false;
  public mapMode: number = 0;
  public selectedInformationTab: number = 0;
  public selectedActionTab: number = 0;
  public selectedActionTabSubPanel: number = 0;
  public selectedChatCategory: number = 0;
  public selectedSoldierType: def.SoldierType = Enumerable.from(def.SOLDIER_TYPES).first((t) => t.id === 500);
  public selectedSoldierNumberType: number = 0;
  public isOpenSoldierDialog: boolean = false;
  public isOpenTownCharactersDialog: boolean = false;
  public isOpenTownDefendersDialog: boolean = false;
  public isOpenCountryCharactersDialog: boolean = false;
  public isOpenAllianceDialog: boolean = false;
  public isOpenWarDialog: boolean = false;
  public isOpenUnitsDialog: boolean = false;
  public isOpenBattleLogDialog: boolean = false;
  public isLoadingBattleLog: boolean = false;
  public isOpenPromotionDialog: boolean = false;
  public isOpenCommandersDialog: boolean = false;
  public isOpenRiceDialog: boolean = false;
  public isOpenSafeDialog: boolean = false;
  public isOpenSafeOutDialog: boolean = false;
  public isOpenTownWarDialog: boolean = false;
  public isOpenOppositionCharactersDialog: boolean = false;
  public isOpenSecretaryDialog: boolean = false;
  public isOpenSecretaryTownDialog: boolean = false;
  public isOpenAddSecretaryDialog: boolean = false;
  public isOpenRemoveSecretaryDialog: boolean = false;
  public isOpenCharacterIconPickerDialog: boolean = false;
  public isOpenPoliciesDialog: boolean = false;
  public isOpenFormationDialog: boolean = false;
  public isOpenFormationAddDialog: boolean = false;
  public isOpenFormationChangeDialog: boolean = false;
  public isOpenCharacterItemDialog: boolean = false;
  public isOpenCharacterItemBuyDialog: boolean = false;
  public isOpenCharacterItemSellDialog: boolean = false;
  public isOpenCharacterItemHandOverDialog: boolean = false;
  public isOpenCharacterItemUseDialog: boolean = false;
  public isOpenSkillDialog: boolean = false;
  public isOpenGenerateItemUseDialog: boolean = false;
  public isOpenCommandCommentDialog: boolean = false;
  public isOpenBuildTownSubBuildingDialog: boolean = false;
  public isOpenRemoveTownSubBuildingDialog: boolean = false;
  public isOpenMapDialog: boolean = false;
  public isOpenWelcomeDialog: boolean = false;
  public isOpenCustomizeFlyingColumnDialog: boolean = false;
  public isOpenRemoveFlyingColumnDialog: boolean = false;
  public isOpenQueueDialog: boolean = false;
  public isOpenCreateTownDialog: boolean = false;
  public isOpenBuyTownDialog: boolean = false;
  public isOpenCommanderTargetCharacterDialog: boolean = false;
  public isOpenImage: boolean = false;
  public isYesno: boolean = false;
  public yesnoMessage: string = '';
  public selectedWarStatus: number = 0;
  public selectedRiceStatus: number = 0;
  public selectedDirection: number = 0;
  public selectedTownType: number = 0;
  public selectedSecretaryType: number = 0;
  public soldierMode: number = 0;
  public isOpenCharacterHelpPopup: boolean = false;

  public soldierNumber: number = 1;
  public battleLogId: number = 0;
  public mapShowType: number = 0;
  public mapDialogMode: number = 0;
  public mapDialogSelectedTown: api.Town = new api.Town(-1);
  public promotionTarget: api.Character = new api.Character(-1);
  public promotionMessage: string = '';
  public targetSecretary: api.Character = new api.Character(-1);
  public targetCharacter: api.Character = new api.Character(0);
  public targetUnit: api.Unit = new api.Unit(-1);
  public flyingColumnAction: number = 0;
  public flyingColumnSoldierType: number = 0;
  public newCountryCommandersMessage: string = '';
  public newCountrySolicitationMessage: string = '';
  public newCountryUnifiedMessage: string = '';
  public newPrivateMessage: string = '';
  public newCountryCommanderSubject: number = 1;
  public newCountryCommanderSubject2: number = 5;
  public newCountryCommanderSubjectData: number = 0;
  public newCountryCommanderSubjectData2: number = 0;
  public newCountryCommanderSubject2Data: number = 0;
  public characterFilterMode: number = 0;
  public commanderPrivateMessage: string = '';
  public newMuteKeywords: string = '';
  public payRiceOrMoney: number = -1;
  public paySafeMoney: number = def.PAY_SAFE_MAX;
  public paySafeTarget: api.Character = new api.Character(-1);
  public canTownWar: boolean = false;
  public selectedIconAtPrivateConfig: api.CharacterIcon = new api.CharacterIcon(-1);
  public newIcon: api.CharacterIcon = new api.CharacterIcon(-1, 0, false, 1, '0.gif');
  public isShowIconOperations = false;
  public selectedCountryPolicyType: def.CountryPolicyType = new def.CountryPolicyType(-1);
  public selectedFormationType: def.FormationType = new def.FormationType(-1);
  public selectedCharacterItemType: { type: def.CharacterItemType, id: number } =
    { type: new def.CharacterItemType(-1), id: -1 };
  public selectedGenerateItemType: def.CharacterItemType = new def.CharacterItemType(-1);
  public selectedSkillType: def.CharacterSkillType = new def.CharacterSkillType(-1);
  public selectedDelayEffect: api.DelayEffect = new api.DelayEffect(-1);
  public selectedTownSubBuilding: def.TownSubBuildingType = new def.TownSubBuildingType(-1);
  public commandCommentMessage: string = '';
  public temporaryAccount: api.Account = new api.Account(-1);

  public callCountryChatFocus?: EventObject;
  public callPrivateChatFocus?: EventObject;
  public imageUrl: string = '';

  public get isOpenDialog(): boolean {
    return this.isOpenSoldierDialog || this.isOpenTownCharactersDialog
      || this.isOpenTownDefendersDialog || this.isOpenCountryCharactersDialog
      || this.isOpenAllianceDialog || this.isOpenWarDialog || this.isOpenUnitsDialog
      || this.isOpenBattleLogDialog || this.isOpenPromotionDialog
      || this.isOpenCommandersDialog || this.isOpenRiceDialog || this.isOpenTownWarDialog
      || this.isOpenOppositionCharactersDialog || this.isOpenSafeDialog || this.isOpenSafeOutDialog
      || this.isOpenSecretaryDialog || this.isOpenAddSecretaryDialog
      || this.isOpenRemoveSecretaryDialog || this.isOpenCharacterIconPickerDialog || this.isOpenPoliciesDialog
      || this.isOpenSecretaryTownDialog || this.isOpenFormationDialog || this.isOpenFormationAddDialog
      || this.isOpenFormationChangeDialog || this.isOpenCharacterItemHandOverDialog || this.isOpenCharacterItemDialog
      || this.isOpenCharacterItemBuyDialog || this.isOpenCharacterItemSellDialog || this.isOpenSkillDialog
      || this.isOpenCharacterItemUseDialog || this.isOpenGenerateItemUseDialog || this.isOpenCommandCommentDialog
      || this.isOpenMapDialog || this.isOpenWelcomeDialog || this.isOpenBuildTownSubBuildingDialog
      || this.isOpenRemoveTownSubBuildingDialog || this.isOpenImage || this.isOpenCustomizeFlyingColumnDialog
      || this.isOpenRemoveFlyingColumnDialog || this.isOpenQueueDialog || this.isOpenCreateTownDialog
      || this.isOpenBuyTownDialog || this.isOpenCommanderTargetCharacterDialog;
  }

  public yesnoEvent: () => void = () => undefined;

  public openCommandDialog(event: string) {
    if (event === 'soldier') {
      this.setSelectedSoldierNumberType(this.selectedSoldierNumberType);
      this.soldierMode = 0;
      this.isOpenSoldierDialog = true;
    } else if (event === 'soldier-religion') {
      this.setSelectedSoldierNumberType(this.selectedSoldierNumberType);
      this.soldierMode = 1;
      this.isOpenSoldierDialog = true;
    } else if (event === 'promotion') {
      this.model.updateOppositionCharacters();
      this.promotionTarget.id = -1;
      this.promotionMessage = '';
      this.isOpenPromotionDialog = true;
    } else if (event === 'rice') {
      if (this.payRiceOrMoney < 0) {
        this.payRiceOrMoney = this.model.characterRiceBuyMax;
      }
      this.selectedRiceStatus = 0;
      this.isOpenRiceDialog = true;
    } else if (event === 'safe') {
      this.paySafeMoney = def.PAY_SAFE_MAX;
      this.isOpenSafeDialog = true;
    } else if (event === 'safe-out') {
      this.model.updateCharacterCountryCharacters();
      this.paySafeMoney = def.PAY_SAFE_MAX;
      this.paySafeTarget.id = -1;
      this.isOpenSafeOutDialog = true;
    } else if (event === 'secretary') {
      this.targetSecretary.id = -1;
      this.targetUnit.id = -1;
      this.model.unitModel.updateUnits();
      this.model.updateCharacterCountryCharacters();
      this.isOpenSecretaryDialog = true;
    } else if (event === 'secretary-add') {
      this.mapDialogSelectedTown = this.model.town;
      this.isOpenAddSecretaryDialog = true;
    } else if (event === 'secretary-remove') {
      this.targetSecretary.id = -1;
      this.model.unitModel.updateUnits();
      this.model.updateCharacterCountryCharacters();
      this.isOpenRemoveSecretaryDialog = true;
    } else if (event === 'secretary-town') {
      this.targetSecretary.id = -1;
      this.model.updateCharacterCountryCharacters();
      this.mapDialogMode = 2;
      this.mapDialogSelectedTown = this.model.town;
      this.isOpenSecretaryTownDialog = true;
    } else if (event === 'flyingcolumn-customize') {
      this.targetSecretary.id = -1;
      this.model.updateCharacterCountryCharacters();
      this.mapDialogMode = 7;
      this.mapDialogSelectedTown = this.model.town;
      this.isOpenCustomizeFlyingColumnDialog = true;
    } else if (event === 'flyingcolumn-remove') {
      this.targetSecretary.id = -1;
      this.model.updateCharacterCountryCharacters();
      this.isOpenRemoveFlyingColumnDialog = true;
    } else if (event === 'formation-add') {
      this.selectedFormationType = new def.FormationType(-1);
      this.isOpenFormationAddDialog = true;
    } else if (event === 'formation-change') {
      this.selectedFormationType = new def.FormationType(-1);
      this.isOpenFormationChangeDialog = true;
    } else if (event === 'item-buy') {
      this.selectedCharacterItemType = { type: new def.CharacterItemType(-1), id: -1 };
      this.isOpenCharacterItemBuyDialog = true;
    } else if (event === 'item-sell') {
      this.selectedCharacterItemType = { type: new def.CharacterItemType(-1), id: -1 };
      this.isOpenCharacterItemSellDialog = true;
    } else if (event === 'item-handover') {
      this.selectedCharacterItemType = { type: new def.CharacterItemType(-1), id: -1 };
      this.isOpenCharacterItemHandOverDialog = true;
    } else if (event === 'item-use') {
      this.selectedCharacterItemType = { type: new def.CharacterItemType(-1), id: -1 };
      this.isOpenCharacterItemUseDialog = true;
    } else if (event === 'item-generate') {
      this.selectedGenerateItemType = new def.CharacterItemType(-1);
      this.isOpenGenerateItemUseDialog = true;
    } else if (event === 'command-comment') {
      this.commandCommentMessage = '';
      this.isOpenCommandCommentDialog = true;
    } else if (event === 'town-move') {
      this.mapDialogMode = 0;
      this.mapDialogSelectedTown = this.model.town;
      this.isOpenMapDialog = true;
    } else if (event === 'town-war') {
      this.mapDialogMode = 1;
      this.mapDialogSelectedTown = this.model.town;
      this.isOpenMapDialog = true;
    } else if (event === 'town-spy') {
      this.mapDialogMode = 5;
      this.mapDialogSelectedTown = this.model.town;
      this.isOpenMapDialog = true;
    } else if (event === 'subbuilding-build') {
      this.selectedTownSubBuilding = new def.TownSubBuildingType(-1);
      this.isOpenBuildTownSubBuildingDialog = true;
    } else if (event === 'subbuilding-remove') {
      this.selectedTownSubBuilding = new def.TownSubBuildingType(-1);
      this.isOpenRemoveTownSubBuildingDialog = true;
    } else if (event === 'queue') {
      this.isOpenQueueDialog = true;
    } else if (event === 'town-create') {
      this.isOpenCreateTownDialog = true;
    }
  }

  public closeDialogs() {
    this.isOpenSoldierDialog = this.isOpenTownCharactersDialog =
      this.isOpenTownDefendersDialog = this.isOpenCountryCharactersDialog =
      this.isOpenAllianceDialog = this.isOpenWarDialog = this.isOpenUnitsDialog =
      this.isOpenBattleLogDialog = this.isOpenPromotionDialog =
      this.isOpenCommandersDialog = this.isOpenRiceDialog = this.isOpenTownWarDialog =
      this.isOpenOppositionCharactersDialog = this.isOpenSafeDialog = this.isOpenSafeOutDialog =
      this.isOpenSecretaryDialog = this.isOpenAddSecretaryDialog =
      this.isOpenRemoveSecretaryDialog = this.isOpenCharacterIconPickerDialog = this.isOpenPoliciesDialog =
      this.isOpenSecretaryTownDialog = this.isOpenFormationDialog = this.isOpenFormationAddDialog =
      this.isOpenFormationChangeDialog = this.isOpenCharacterItemHandOverDialog =
      this.isOpenCharacterItemDialog = this.isOpenCharacterItemBuyDialog = this.isOpenCharacterItemSellDialog =
      this.isOpenSkillDialog = this.isOpenCharacterItemUseDialog = this.isOpenGenerateItemUseDialog =
      this.isOpenCommandCommentDialog = this.isOpenMapDialog = this.isOpenWelcomeDialog =
      this.isOpenBuildTownSubBuildingDialog = this.isOpenRemoveTownSubBuildingDialog = this.isOpenImage =
      this.isOpenCustomizeFlyingColumnDialog = this.isOpenRemoveFlyingColumnDialog = this.isOpenQueueDialog =
      this.isOpenCreateTownDialog = this.isOpenBuyTownDialog = this.isOpenCommanderTargetCharacterDialog = false;
  }

  public closeMapDialog() {
    if (this.mapDialogMode === 0) {
      this.model.commands.inputer.inputMoveCommand(17, this.mapDialogSelectedTown.id);
    } else if (this.mapDialogMode === 1) {
      this.model.commands.inputer.inputMoveCommand(13, this.mapDialogSelectedTown.id);
    } else if (this.mapDialogMode === 2) {
      this.model.commands.inputer.inputSecretaryMoveCommand(47, this.targetSecretary.id, this.mapDialogSelectedTown.id);
    } else if (this.mapDialogMode === 5) {
      this.model.commands.inputer.inputMoveCommand(61, this.mapDialogSelectedTown.id);
    } else if (this.mapDialogMode === 6) {
      this.model.giveTownToCountry(this.mapDialogSelectedTown.id);
    } else if (this.mapDialogMode === 7) {
      this.model.commands.inputer.inputCustomizeFlyingColumnCommand(67, this.targetSecretary.id,
        this.flyingColumnAction, this.mapDialogSelectedTown.id, this.flyingColumnSoldierType);
    }
    this.isOpenMapDialog = false;
  }

  public get chatObj(): IChatMessageContainer | undefined {
    if (this.selectedActionTab === 1) {
      if (this.selectedChatCategory === 0) {
        return this.model.countryChat;
      } else if (this.selectedChatCategory === 1) {
        return this.model.privateChat;
      } else if (this.selectedChatCategory === 5) {
        return this.model.globalChat;
      } else if (this.selectedChatCategory === 6) {
        return this.model.global2Chat;
      }
    }
    return undefined;
  }

  @Watch('selectedChatCategory')
  @Watch('selectedActionTab')
  @Watch('selectedActionTabSubPanel')
  public onChatTabChanged() {
    this.model.countryChat.isOpen =
      this.model.privateChat.isOpen =
      this.model.globalChat.isOpen =
      this.model.global2Chat.isOpen =
      this.model.promotions.isOpen =
      this.model.countryThreadBbs.isOpen =
      this.model.globalThreadBbs.isOpen =
      this.model.isOpenIssueBbs = false;
    if (this.selectedActionTab === 1) {
      const obj = this.chatObj;
      if (obj) {
        obj.isOpen = true;
      }
    } else if (this.selectedActionTab === 3) {
      if (this.selectedActionTabSubPanel === 0) {
        this.model.promotions.isOpen = true;
      } else if (this.selectedActionTabSubPanel === 2) {
        this.model.globalThreadBbs.isOpen = true;
      } else if (this.selectedActionTabSubPanel === 9) {
        this.model.isOpenIssueBbs = true;
        this.model.isIssueBbsUnread = false;
      }
    } else if (this.selectedActionTab === 2) {
      this.model.countryThreadBbs.isOpen = true;
    }
  }

  public getPolicyPoint(type: def.CountryPolicyType): number {
    const policy = Enumerable
      .from(this.model.store.policies)
      .firstOrDefault((p) => p.type === type.id && p.countryId === this.model.character.countryId);
    if (policy) {
      return policy.status === api.CountryPolicy.statusBoosted ? type.point / 2 : type.point;
    } else {
      return type.point;
    }
  }

  public mounted() {
    this.model.onCreate(() => this.$router);
    if (this.$route.query.first) {
      this.isOpenWelcomeDialog = true;
    }
    if (this.$route.query.app) {
      (window as any).sangokukmy_app = this.$route.query.app;
    }
    if ((window as any).sangokukmy_app) {
      this.isApp = true;
    }
  }

  public destroyed() {
    this.model.onDestroy();
  }

  private readyPrivateChat(chara: api.Character) {
    this.model.privateChat.sendTo = chara;
    this.selectedActionTab = 1;
    this.selectedChatCategory = 1;
    if (this.callPrivateChatFocus) {
      this.callPrivateChatFocus.fire();
    }
  }

  private readyPrivateChatById(id: number) {
    const chara = Enumerable
      .from(this.model.store.characters)
      .firstOrDefault((c) => c.id === id);
    if (chara) {
      this.readyPrivateChat(chara);
    }
  }

  private readyOtherCountryChat(country: api.Country) {
    this.model.countryChat.sendTo = country;
    this.selectedActionTab = 1;
    this.selectedChatCategory = 0;
    if (this.callCountryChatFocus) {
      this.callCountryChatFocus.fire();
    }
  }

  private readyOtherCountryChatById(id: number) {
    const country = Enumerable.from(this.model.countries)
      .firstOrDefault((c) => c.id === id);
    if (country) {
      this.readyOtherCountryChat(country);
    }
  }

  private onMapDialogSelected(townId: number) {
    const town = this.model.towns.find((t) => t.id === townId);
    if (town) {
      this.mapDialogSelectedTown = town;
    }
  }

  private onMapLogScrolled(event: any) {
    if (this.isScrolled(event)) {
      this.model.loadOldMapLogs();
    }
  }

  private onCharacterLogScrolled(event: any) {
    if (this.isScrolled(event)) {
      this.model.loadOldCharacterLogs();
    }
  }

  private readyEditCommanders() {
    this.isOpenCommandersDialog = false;
    this.selectedActionTab = 3;
    this.selectedActionTabSubPanel = 1;
    if (typeof(this.$refs.commandersMessageInput) === 'object') {
      if (Array.isArray(this.$refs.commandersMessageInput)) {
        (this.$refs.commandersMessageInput[0] as HTMLTextAreaElement).focus();
      } else {
        (this.$refs.commandersMessageInput as HTMLTextAreaElement).focus();
      }
    }
  }

  private isScrolled(event: any): boolean {
    // スクロールの現在位置 + 親（.item-container）の高さ >= スクロール内のコンテンツの高さ
    return (event.target.scrollTop + 50 + event.target.offsetHeight) >= event.target.scrollHeight;
  }

  private resetNewIcon() {
    this.newIcon = new api.CharacterIcon(0, 0, false, 1, '0.gif');
  }

  private resetTargetCharacter() {
    this.targetCharacter = new api.Character(0);
  }

  private setSelectedSoldierNumberType(num: number) {
    this.selectedSoldierNumberType = num;
    if (num === 0) {
      this.soldierNumber = this.model.character.leadership;
    } else if (num === 1) {
      this.soldierNumber = 1;
    } else if (num === 2) {
      this.soldierNumber = 9;
    } else if (num === 3) {
      if (this.model.character.leadership % 10 === 9) {
        this.soldierNumber = this.model.character.leadership;
      } else {
        this.soldierNumber = Math.floor(this.model.character.leadership / 10) * 10 - 10 + 9;
      }
    }
  }

  private openImage(event: any) {
    this.imageUrl = event;
    this.isOpenImage = true;
  }

  private openIssueLink(id: number) {
    this.selectedActionTab = 3;
    this.selectedActionTabSubPanel = 9;
    (this.$refs.bbs as any).openIssue(id);
  }

  private openYesno(event: any) {
    this.yesnoMessage = event.message;
    this.yesnoEvent = event.onYes;
    this.isYesno = true;
  }

  private reloadPage() {
    window.location.href = '/status?app=ios';
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/common.scss';
@import '@/scss/bootstrap-helper.scss';
@import '@/scss/country-color.scss';
@import '@/scss/global-colors.scss';

$current-display-height: 40px;
$nav-tab-height: 40px;
$map-mini-mode-height: 320px;
$left-side-fixed-height: $current-display-height + $nav-tab-height;
$right-side-fixed-height: $nav-tab-height;

$color-navigation-commands: #e0e0e0;

#status-root, #status-root > div.row {
  @include media-query-lower(md) {
    padding-left: 0;
    padding-right: 0;
    margin-left: 0;
    margin-right: 0;
  }
  & > div {
    @include media-query-lower(md) {
      padding-left: 0;
      padding-right: 0;
      margin-left: 0;
      margin-right: 0;
    }
  }
}

// Bootstrapによるタブ
ul.nav {
  font-size: 1rem;
  li {
    height: 40px;
  }
}

// ドロップダウン
.dropdown-toggle-custom {
  position: relative;
}
.dropdown-menu-custom {
  right: 0;
  left: auto;
}

// 現在年月
#current-display-wrapper {
  display: flex;
  flex-wrap: wrap;
  min-height: 40px;

  @include media-query-lower(md) {
    flex-direction: column;
    height: auto;
    align-items: center;
    text-align: center;
  }

  #current-display {
    flex: 1;
    text-align: center;
    height: $current-display-height;
    line-height: $current-display-height;
    font-size: 1.4rem;
    .number {
      font-weight: bold;
      color: #080;
      padding: 0 8px;
    }
    .month-timer {
      font-size: 0.7em;
      margin-left: 16px;
      color: #e07be0;
    }
  }

  #current-war-status {
    display: block;
    font-weight: bold;
    line-height: calc(#{$current-display-height} - 10px);
    margin: 2px;
    border: 3px solid #e00;
    color: white;
    padding: 0 12px;
    border-radius: 12px;
    &.in-war {
      background-color: #e00;
    }
    &.in-battle-royal {
      background-color: #d0c;
      border-color: #d0c;
    }
    &.in-ready {
      color: #e00;
      border-style: dashed;
    }
    &.in-reset {
      background-color: #03c;
      border-color: #03c;
    }
  }
}

// 指令
#directive {
  height: 40px;
  padding: 4px 8px;
  line-height: 32px;
  border-width: 0;
  border-left-width: 16px;
  border-style: solid;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  @include country-color-light('background-color');
  @include country-color-deep('color');
  @include country-color-deep('border-color');
  @include media-query-lower(md) {
    height: auto;
    max-height: 80vh;
    white-space: normal;
    line-height: 140%;
  }
}

// マップのコンテナ
#map-container {
  height: calc(65vh - #{$left-side-fixed-height});
  min-height: $map-mini-mode-height;

  &.mini-mode {
    height: $map-mini-mode-height;
  }

  .online-list {
    height: 100%;
    overflow: auto;
    padding: 8px;

    .online-list-item {
      margin-bottom: 24px;
      h3 {
        font-size: 1.4rem;
        margin-bottom: 8px;
      }
    }
  }

  // 武将情報
  .character-information {
    height: 100%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    @include country-color-deep('border-color');
    @include country-color-light('background-color');
    .commands {
      text-align: right;
      min-height: 44px;
      padding: 4px 4px 0 4px;
      border-bottom: 1px dotted black;
      button {
        margin-right: 4px;
      }
    }
    h4 {
      margin: 0;
      padding: 12px 0;
      font-size: 1.4rem;
      line-height: 2rem;
      text-align: center;
      font-weight: bold;
      border-top: 2px dashed;
      @include country-color-deep('color');
      @include country-color-deep('border-top-color');
      img {
        margin-right: 8px;
      }
    }
    .character-logs {
      margin-top: 16px;
    }
  }
}

// 情報欄
.information-content {
  height: calc(35vh - #{$nav-tab-height});
  min-height: 180px;
  overflow: hidden;
  &.mini-mode {
    height: calc(100vh - #{$left-side-fixed-height} - #{$nav-tab-height} - #{$map-mini-mode-height});
  }
  @include media-query-lower(md) {
    margin-bottom: 48px;
    overflow: visible;
  }
  @include media-query-lower(sm) {
    overflow: hidden;
    height: auto;
    min-height: 220px;
    &.mini-mode {
      height: auto;
      .content-main {
        height: 100vh !important;
      }
    }
  }
  border-width: 0;
  border-style: solid;
  @include country-color-deep('border-color');
  @include country-color-light('background-color');
  transition: border-color .1s, background-color .1s;
  h4 {
    display: flex;
    margin: 0;
    font-size: 1.4rem;
    height: 2rem;
    line-height: 2rem;
    text-align: center;
    font-weight: bold;
    @include country-color-deep('background-color');
    @include country-color-light('color');
    transition: color .1s, background-color .1s;
    .header {
      flex: 1;
    }
  }
  .content-main {
    height: calc(100% - 2rem - 44px);
    @include media-query-lower(sm) {
      height: 350px !important;
    }
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
  .commands {
    min-height: 44px;
    padding: 4px 4px 0 4px;
    background: $color-navigation-commands;
    button {
      margin-right: 4px;
    }
  }
  &.information-data {
    .content-main {
      padding: 8px 12px;
      height: calc(100% - 2rem);
      display: flex;
      flex-direction: column;
      overflow: auto;
      h3 {
        font-size: 1.2rem;
        margin: 8px 0;
      }
      .data-list {
        flex: 1;
        margin: -8px -12px;
        overflow-y: hidden;
      }
    }
  }
  &.information-logs {
    background-color: $global-table-background;
    border-color: $global-table-border;
    h4 {
      background-color: $global-table-border;
      color: $global-table-background;
    }
    .content-main {
      height: calc(100% - 2rem);
    }
  }
}

// 右側通知のバッジ
.tab-text {
  position: relative;
  .tab-notify {
    position: absolute;
    top: 0;
    left: calc(100% + 4px);
    border-radius: 50%;
    width: 6px;
    height: 6px;
    background: red;
  }
}

// 強調されたタブ
.tab-highlighted {
  background-color: #fde;
}

// 右側の内容
.right-side-content {
  height: calc(100vh - #{$right-side-fixed-height});
  padding-top: 8px;

  &.content-chat {
    display: flex;
    flex-direction: column;

    .nav {
      .active {
        background-color: #6bf;
      }
    }

    .messages {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
  }

  &.content-meeting {
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }

  &.content-soldier {
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }

  &.content-setting {
    .setting-list {
      overflow: auto;
      -webkit-overflow-scrolling: touch;

      .setting-row {
        margin-bottom: 24px;
        h3 {
          @include country-color-deep('background-color');
          @include country-color-light('color');
          padding: 2px 8px;
          border-radius: 8px;
        }
        h4 {
          color: gray;
          font-size: 1.2rem;
        }
        .setting-section {
          margin: 8px 0 24px;
        }
        .current-message {
          margin: 4px 8px;
          .current-message-content {
            margin: 0 12px;
            padding: 4px 8px;
            @include country-color-light('background-color');
            @include country-color-deep('color');
            .current-message-writer {
              text-align: right;
              margin-top: 8px;
              font-size: 0.9rem;
              font-weight: bold;
            }
          }
          .message-empty {
            color: gray;
          }
        }

        // 武将アイコン選択
        .character-icon-selection {
          display: flex;
          flex-wrap: wrap;
          .item {
            position: relative;
            overflow: hidden;
            border: 2px solid transparent;
            .overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              opacity: 0;
              background: black;
              transition: opacity .16s;
              cursor: pointer;
              &:hover {
                opacity: 0.2;
              }
            }
            &.selected {
              border-color: #f4d;
            }
            &.item-new {
              width: 68px;
              height: 68px;
              text-align: center;
              line-height: 68px;
              font-size: 48px;
              font-weight: bold;
            }
          }
        }

        textarea {
          width: 100%;
          height: 160px;
        }
        .buttons {
          text-align: right;
          button {
            margin-left: 4px;
          }
        }
      }
    }
  }
}

// ダイアログ
#status-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  opacity: 0;
  pointer-events: none;

  .dialog-background {
    width: 100%;
    height: 100%;
    background: black;
    opacity: 0;
    transition: opacity .2s ease-in;
  }

  .dialog-image {
    cursor: pointer;
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    text-align: center;
    overflow: auto;
  }

  .dialog-body {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    width: 70vw;
    height: 90vh;
    background: #efefef;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 8px 8px 8px rgba(0, 0, 0, 0.3);

    @media screen and (max-width: 600px) {
      width: 98vw;
    }
    @media screen and (max-height: 400px) {
      height: 98vh;
    }

    .dialog-title {
      display: flex;
      justify-content: center;
      text-align: center;
      padding: 8px 0 4px;
      border-bottom-width: 2px;
      border-bottom-style: dashed;
      @include country-color-deep('color');
      @include country-color-deep('border-bottom-color');
      @include country-color-light('background-color');
      .header {
        flex: 1;
      }
      .help {
        margin-right: 8px;
        margin-top: -4px;
      }
    }

    .dialog-content {
      flex: 1;
      padding: 4px 8px;
      overflow: auto;
      -webkit-overflow-scrolling: touch;

      .content-section {
        margin-top: 24px;
      }

      &.dialog-content-training {
        button {
          margin: 0 16px 16px 0;
        }
      }

      &.dialog-content-soldier {
        .dialog-content-soldier-main {
          display: flex;
          flex-direction: column;
          height: 100%;

          .row {
            margin-right: 0;
          }
          .content-row {
            background-color: #dedede;
            padding: 8px 16px;
            text-align: center;
            &:first-child {
              background: none;
            }
            .label {
              color: #666;
            }
            .value {
              font-weight: bold;
            }
          }

          .character-list {
            flex: 1;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
          }

          .soldier-input {
            margin-top: 12px;
            background: #dedede;
          }
        }
      }

      &.dialog-content-promotion {
        .dialog-content-promotion-main {
          display: flex;
          flex-direction: column;
          height: 100%;

          .character-list {
            flex: 1;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
          }

          .promotion-input {
            textarea {
              width: 100%;
              height: 100px;
            }
          }
        }
      }

      &.dialog-content-welcome {
        .dialog-content-welcome-main {
          margin: 0 24px;
          h3 {
            &:first-child {
              margin-top: 12px;
            }
            margin: 32px 0 24px;
          }
        }
      }

      &.dialog-content-secretary {
        .dialog-content-secretary-main {
          display: flex;
          flex-direction: column;
          height: 100%;

          .character-list, .item-list {
            flex: 1;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
          }

          .map {
            overflow: hidden;
            -webkit-overflow-scrolling: touch;
          }

          .character-list-top-of-map {
            flex: 1;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
          }

          .unit-list {
            flex: 0.8;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
      }

      &.dialog-content-directive {
        .directive {
          margin-bottom: 24px;
          background-color: #dedede;
          .active-message {
            display: none;
          }
          .directive-main {
            padding: 8px 16px;
          }
          &.active {
            background-color: #ffdede;
            .active-message {
              display: block;
              background-color: #f5c0e9;
              padding-left: 16px;
            }
          }
        }
        .writer {
          text-align: right;
          font-size: 0.9em;
          font-weight: bold;
          margin-top: 12px;
        }
      }

      &.dialog-content-rice {
        .content {
          margin: 0 24px;
          .row {
            margin-right: 0;
          }
          .content-row {
            background-color: #dedede;
            padding: 8px 16px;
            text-align: center;
            &:first-child {
              background: none;
            }
            .label {
              color: #666;
            }
            .value {
              font-weight: bold;
            }
          }
          .commands {
            margin-top: 16px;
            button {
              margin-right: 8px;
            }
          }
          .command-parameters {
            margin-top: 24px;
            input {
              font-size: 2em;
              width: 5em;
              padding: 0 12px;
              text-align: right;
            }
            .result {
              font-weight: bold;
              color: red;
              font-size: 1.4em;
            }
          }
        }
      }

      &.dialog-content-safe-out {
        height: 100%;
        .dialog-content-safe-out-main {
          display: flex;
          flex-direction: column;
          height: 100%;

          .character-list {
            flex: 1;
            overflow: auto;
          }
        }
      }
    }

    .dialog-footer {
      display: flex;
      margin: 8px;
      padding-top: 8px;
      border-top: 1px solid #dedede;

      .left-side {
        flex: 1;
      }
    }
  }

  &.show {
    opacity: 1;
    pointer-events: all;
    .dialog-background {
      opacity: 0.5;
    }
  }
}

/*
    <div id="status-yesno">
      <div class="yesno-background"></div>
      <div class="yesno-dialog">
        <div class="message">本当によろしいですか？</div>
        <div class="commands">
          <button class="btn btn-light">いいえ</button>
          <button class="btn btn-primary">はい</button>
        </div>
      </div>
    </div>*/
#status-yesno {
  width: 100%;
  position: relative;
  z-index: 100;
  .yesno-background {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
  }
  .yesno-dialog {
    position: fixed;
    bottom: 0;
    left: calc(50% - 150px);
    width: 300px;
    height: 120px;
    max-width: 100vw;
    padding: 16px 32px;
    text-align: center;
    background: white;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    .message {
      flex: 1;
    }
  }
}
</style>
