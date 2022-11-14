import type { NextPage } from "next";
import Head from "next/head";
import { useActiveWeb3React } from "hooks/useActiveWeb3React";
import { useEffect, useState } from "react";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { injected } from "config/constants/wallets";
import { connectorLocalStorageKey } from "config/connectors/index";
import { useContract, web3UseConnect } from "hooks/useContract";
import BFP139 from '../abi/BFP139.json'
import { useTranslation } from "react-i18next";
import { NetworkContextName } from "config/index";
import { languageList } from '../react-i18next/locales/resources.js'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Image from 'next/image'
import HeaderIconBn from '../../public/bn_icon.png'
import languageIcon from '../../public/switch language_icon.png'
import pageBackground from '../assets/pageBackground.svg'
import statusBackground from '../assets/statusBackground.svg'
import identity_icon from '../assets/identity_icon.svg'
import numbering_icon from '../assets/numbering_icon.svg'
import qualifying_icon from '../assets/qualifying_icon.svg'
import bnb_01 from '../assets/bnb_01.svg'
import gd_icon from '../assets/gd_icon.svg'
import bg_02 from '../assets/bg_02.png'
import prize_pool_bg from '../assets/prize_pool_bg.png'
import prize_pool_icon from '../assets/prize_pool_icon.svg'
import k from '../assets/k.svg'
import incomel_bg from '../assets/incomel_bg.svg'
import incomel_icon from '../assets/incomel_icon.svg'
import start from '../assets/start.png'
import m_prize_pool_bg from '../assets/m_prize_pool_bg.png'
import BigNumber from 'bignumber.js'
import { utils } from 'ethers/lib/ethers'
import { isMobile } from "web3modal";

const Home: NextPage = () => {
    // 是否展示语言选择框
    const [isShowLanguage, SetIsShowLanguage] = useState(false)
    // 当前选中语言
    const [currLanguage, SetCurrLanguage] = useState(0)
    // 当前身份
    const [currStatus, SetCurrStatus] = useState('farm')
    // 我的编号
    const [currCode, SetCurrCode] = useState('0')
    // 邀请链接
    const [InvitationLink, SetInvitationLink] = useState('0')
    // 已邀请农场数
    const [inviteFarm, SetInviteFarm] = useState('0')
    // 奖金池金额
    const [prizePoolNum, SetPrizePoolNum] = useState(0)
    // 当前获奖编号
    const [currentAwardNumber, SetCurrentAwardNumber] = useState('139')
    // 最新编号
    const [nextPrizeNumber, SetNextPrizeNumber] = useState('139')
    // 农场收益
    const [farmIncome, SetFarmIncome] = useState('0')
    // 农庄收益
    const [IFarmIncome, SetIFarmIncome] = useState('0')
    // 庄园收益
    const [estateIncome, SetEstateIncome] = useState('0')
    // 邀请地址
    const [inviteAddress, SetInviteAddress] = useState('')
    // 邀请链接颜色
    const [isInvitationLink, SetIsInvitationLink] = useState(false)




    const { t, i18n } = useTranslation();
    const { account, chainId, error, activate } = useActiveWeb3React();
    const { active } = useWeb3React();
    const { active: networkActive, error: networkError, activate: activateNetwork } = useWeb3React(NetworkContextName);
    // 实例化合约
    const contract = web3UseConnect(BFP139, '0x43a2a4ea38873c35bb126ed38f1251eca14c6feb')
    useEffect(() => {
        if (!account) {
            return
        }
        console.log(account);
        // 初始化数据
        initData()

    }, [account]);
    // 获取邀请地址
    useEffect(() => {
        const query = window.location.href.split("?")[1].split("&")[0].split("=")[1]
        if (query) {
            SetInviteAddress(query)
        }
        if (isMobile()) {
            import("amfe-flexible");
        }
        activate(injected, undefined, true).catch((error) => {
            activate(injected);
        });
    }, [])
    const initData = async () => {
        // 获取是否开始排位
        const isRank = await contract.methods.isRank(account).call()
        if (!isRank) {
            return
        }
        // 获取奖池金额
        const BalanceOfContract = await contract.methods.getBalanceOfContract().call()
        // 设置奖池金额
        SetPrizePoolNum(Number(new BigNumber(BalanceOfContract).div(10 ** 18).toFixed(2)))
        // 获取邀请数量数组[一代,二代,三-七代]
        const inviteNumArr = await contract.methods.getInviteNum(account).call()
        console.log(inviteNumArr);
        // 设置身份
        if (inviteNumArr[0] >= 2) {
            SetCurrStatus("manor")
        }
        // 设置分级收益
        SetFarmIncome(new BigNumber('0.5').times(1000).times(inviteNumArr[0]).div(1000).toString())
        SetIFarmIncome(new BigNumber('0.2').times(1000).times(inviteNumArr[1]).div(1000).toString())
        SetEstateIncome(new BigNumber('0.02').times(1000).times(inviteNumArr[2]).div(1000).toString())
        // 设置我的农场数量
        SetInviteFarm(inviteNumArr[0])
        // 获取我的编号
        const addressRank = await contract.methods.getAddressRank(account).call()
        // 设置我的编号
        SetCurrCode(`${152 + Number(addressRank) + 1}`)
        // 设置邀请链接
        SetInvitationLink('http://97.74.84.218:3000/?address=' + account)
        // 设置邀请链接文字颜色
        SetIsInvitationLink(true)

        // 获取最新编号
        const LastRank = await contract.methods.getLastAddressRank().call()
        // 设置最新编号
        SetNextPrizeNumber(`${152 + Number(LastRank) + 1}`)
        // 查询是否有人获奖
        const isHaveRewards = await contract.methods.isHaveReward().call()

        if (isHaveRewards) {
            // 获取最新获奖编号
            const LastRewardRank = await contract.methods.getRewardAddressRank().call()
            // 设置最新获奖编号
            SetCurrentAwardNumber(`${152 + Number(LastRewardRank) + 1}`)
        }


    }

    // 连接钱包 pc支持metamask和coinbase 手机各大钱包都支持
    const connectWallet = () => {
        activate(injected, undefined, true).catch((error) => {
            activate(injected);
        });
    }
    // 开始排位
    const startRank = async () => {
        const isRank = await contract.methods.isRank(account).call()

        if (!inviteAddress || isRank) {
            alert('排位进行中')
            return
        }
        // alert(contract)
        contract?.methods.pay(inviteAddress).send({ from: account, value: utils.parseEther("1.39") })

    }

    const testButton = () => {
        console.log(1);

    }
    return (
        (
            <div>
                <Head>
                    <title>BFP1.39</title>
                    <meta name="viewport" content="width=device-width,initial-scale=1" />
                    <meta name="description" content="Generated by create next app" />
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <div className="HeaderBox">

                    <div className="Header">
                        <div className="HeaderIconBox">
                            <div className="HeaderIcon">
                                <Image src={HeaderIconBn}
                                    className="HeaderIcon" alt="" />
                            </div>

                            <div className="HeaderIconText">BFP 1.39</div>
                        </div>
                        <div className="languageIconBox">
                            <div className="languageIcon">
                                <Image src={languageIcon}
                                    alt="" onClick={() => {
                                        SetIsShowLanguage(!isShowLanguage)
                                    }} />
                            </div>

                            {
                                isShowLanguage && languageList && <div className="languageSelectBox">
                                    {
                                        languageList.map((item, idx) => {

                                            return (
                                                <div key={item.languageTitle + idx} className={currLanguage == idx ? 'languageSelectItem currLanguageSelectItem' : 'languageSelectItem'} onClick={() => {
                                                    SetCurrLanguage(idx)
                                                    i18n.changeLanguage(item.languageName)
                                                    SetIsShowLanguage(false)
                                                }}>{item.languageTitle}</div>
                                            )

                                        })
                                    }
                                </div>
                            }


                            <div className="accountBox" onClick={connectWallet}>
                                {
                                    !account ? "connect" : !active && networkError ? "unknownError" : account?.substring(0, 4) + '...' + account?.substring(account.length - 5, account.length - 1)
                                }
                                {/* {account} */}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="contentBox">
                    {/* <div className="pageBackground">
                        <Image src={pageBackground}
                            alt="" />
                    </div> */}
                    {
                        isMobile() ? <></> : <div className="pageBackground">
                            <Image src={pageBackground}
                                alt="" />
                        </div>
                    }
                    {/* 个人信息栏 */}
                    <div className="statusBox">
                        <div className="statusBackground" >
                            {/* <Image src={isMobile() ? m_bg_01 : statusBackground}
                                alt="" /> */}
                        </div>
                        <div className="statusItem">
                            <div className="itemLeft">
                                <div className="identity_icon">
                                    <Image src={identity_icon}
                                        alt="" />
                                </div>
                                <div className="itemText">
                                    {t('currentStatus')}
                                </div>
                            </div>
                            <div className="itemRight">
                                {t(currStatus)}
                            </div>
                        </div>
                        <div className="statusItem">
                            <div className="itemLeft">
                                <div className="identity_icon">
                                    <Image src={numbering_icon}
                                        alt="" />
                                </div>
                                <div className="itemText">
                                    {t('myNumber')}
                                </div>
                            </div>
                            <div className="itemRight">
                                {currCode}
                            </div>
                        </div>
                    </div>
                    {/* 排位栏 */}
                    <div className="qualifyingBox">
                        <div className="quabg">
                            <Image src={bg_02}
                                alt="" />
                        </div>
                        <div className="qualifyingTitle">
                            <div className="qualifying_icon">
                                <Image src={qualifying_icon}
                                    alt="" />
                            </div>
                            <div className="qualifyingTitleText">
                                {t('qualifying')}
                            </div>
                        </div>
                        <div className="startQualifying" onClick={startRank}>
                            <div className="startQualifying_icon">
                                <Image src={start}
                                    alt="" />
                            </div>
                        </div>
                        <div className="invitationLinkBox">
                            <div className="invitationLinkTitle">{t('invitationLink')}</div>
                            <div className={isInvitationLink ? "activeText invitationLink" : "invitationLink"} >{InvitationLink == "0" ? t('participateFirst') : InvitationLink}</div>
                            <CopyToClipboard text={InvitationLink == "0" ? t('participateFirst') : InvitationLink}
                                onCopy={testButton}>
                                <div className="copyBtn">{t('copy')}</div>
                            </CopyToClipboard>
                        </div>
                        <div className="myFarmBox">
                            <div className="myFarmTitle">{t('myFarm')}</div>
                            <div className="myFarmIconBox">
                                {Number(inviteFarm) >= 1 && <div className="myFarmIconItem"><Image src={bnb_01}
                                    alt="" /></div>}
                                {Number(inviteFarm) >= 2 && <div className="myFarmIconItem"><Image src={bnb_01}
                                    alt="" /></div>}
                                {Number(inviteFarm) == 3 && <div className="myFarmIconItem"><Image src={bnb_01}
                                    alt="" /></div>}
                                {Number(inviteFarm) > 3 && <div className="myFarmIconItem"><Image src={gd_icon}
                                    alt="" /></div>}

                            </div>
                            <div className="myFarmTitle">{t('NumberOfFarms')}</div>
                            <div className="inviteFarm">{inviteFarm}</div>
                        </div>
                    </div>
                    {/* 奖金池 */}
                    <div className="prizePoolBox">
                        <div className="prize_pool_bg">
                            <Image src={isMobile() ? m_prize_pool_bg : prize_pool_bg}
                                alt="" />
                        </div>
                        <div className="prizePoolBoxTitle">
                            <div className="prize_pool_icon">
                                <Image src={prize_pool_icon}
                                    alt="" />
                            </div>
                            <div className="prizePoolBoxTitleText">{t('prizePool')}</div>
                        </div>
                        <div className="prizePoolNum">
                            <div className="prizePoolNum_bg">
                                <Image src={k}
                                    alt="" />
                            </div>
                            <div className="prizePoolText">{prizePoolNum} BNB</div>
                        </div>
                        <div className="currentAwardNumber">{t('currentAwardNumber')}</div>
                        <div className="currentAwardCode">{currentAwardNumber}</div>
                        <div className="nextPrizeNumber">{t('nextPrizeNumber')}</div>
                        <div className="nextPrizeCode">{nextPrizeNumber}</div>
                    </div>
                    {/* 我的收益 */}
                    <div className="myEarnings">
                        {
                            isMobile() ? <></> : <div className="incomel_bg">
                                <Image src={incomel_bg}
                                    alt="" />
                            </div>
                        }
                        <div className="myEarningsTitle">
                            <div className="incomel_icon">
                                <Image src={incomel_icon}
                                    alt="" />
                            </div>
                            <div className="myEarningsTitleText">{t('myEarnings')}</div>

                        </div>
                        <div className="earningsBox">
                            <div className="earningsBoxItem">
                                <div className="earningsBoxItemLeft">
                                    {t('farmIncome')}
                                </div>
                                <div className="earningsBoxItemRight">
                                    <div >{farmIncome}</div>
                                    <div>BNB</div>
                                </div>
                            </div>
                            <div className="earningsBoxItem">
                                <div className="earningsBoxItemLeft">
                                    {t('FarmIncome')}
                                </div>
                                <div className="earningsBoxItemRight">
                                    <div >{IFarmIncome}</div>
                                    <div>BNB</div>
                                </div>
                            </div>
                            <div className="earningsBoxItem">
                                <div className="earningsBoxItemLeft">
                                    {t('estateIncome')}
                                </div>
                                <div className="earningsBoxItemRight">
                                    <div >{estateIncome}</div>
                                    <div>BNB</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer">Binance Farm Planting Program</div>
            </div>
        )

    );
};

export default Home;
