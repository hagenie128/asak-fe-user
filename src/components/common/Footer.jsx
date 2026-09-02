// 학습용 자리표시자: 공통 푸터 컴포넌트입니다.
// 하단 footer 버튼 2개 형식 컴포넌트


import React from 'react'

/**
 * @param {string} leftText - 왼쪽 버튼 텍스트 (예: '뒤로가기', '메뉴 더 담기', '주문 번호만 출력하기')
 * @param {string} rightText - 오른쪽 버튼 텍스트 (예: '결제하기', '영수증 출력')
 * @param {() => void} onLeftClick - 왼쪽 버튼 클릭 핸들러
 * @param {() => void} onRightClick - 오른쪽 버튼 클릭 핸들러
 * @param {boolean} [rightDisabled=false] - 오른쪽(주요) 버튼 비활성화 여부
 * @param {boolean} [leftDisabled=false] - 왼쪽 버튼 비활성화 여부
 */

export default function Footer({
    leftText,
    rightText,
    onLeftClick,
    onRightClick,
    rightDisabled = false,
    leftDisabled = false,
}) {
    return (
        <>
            <footer className="page_footer">
                <button type="button" className="payment-page__footer_btn footer_left_btn"
                    onClick={onLeftClick}
                    disabled={leftDisabled}>
                    {leftText}
                </button>
                <button type="button"
                    className="payment-page__footer_btn footer_right_btn"
                    onClick={onRightClick}
                    disabled={rightDisabled}>
                    {rightText}
                </button>
            </footer>
        </>
    )
}
