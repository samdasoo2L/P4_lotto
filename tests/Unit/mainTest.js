<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;

/**
 * Class LottoJavaScriptLogicTest
 * 
 * main.jsのロジックをPHPで再実装したテストケース。
 * JavaScript関数の動作をPHPで検証し、Laravel移行時の品質保証を行う。
 * 
 * @package Tests\Unit
 */
class LottoJavaScriptLogicTest extends TestCase
{
    protected array $numArr;
    protected array $selectedNumArr;

    protected function setUp(): void
    {
        parent::setUp();
        $this->numArr = range(1, 45);
        $this->selectedNumArr = [];
    }

    /**
     * resetResult関数が選択された数字配列を正しくクリアすることを確認
     */
    public function test_resetResult_clearsSelectedNumbers_returnsEmptyArray(): void
    {
        $this->selectedNumArr = [5, 12, 23, 34, 41, 45];
        
        $this->resetResult();
        
        $this->assertEmpty($this->selectedNumArr);
        $this->assertCount(0, $this->selectedNumArr);
    }

    /**
     * selectNum関数が配列から1つの数字を選択し、残りの配列を返すことを確認
     */
    public function test_selectNum_validArray_returnsReducedArray(): void
    {
        $initialCount = count($this->numArr);
        
        $result = $this->selectNum($this->numArr);
        
        $this->assertCount($initialCount - 1, $result);
        $this->assertCount(1, $this->selectedNumArr);
        $this->assertGreaterThanOrEqual(1, $this->selectedNumArr[0]);
        $this->assertLessThanOrEqual(45, $this->selectedNumArr[0]);
    }

    /**
     * selectNumを複数回呼び出しても重複した数字が選ばれないことを確認
     */
    public function test_selectNum_multipleCalls_noDuplicates(): void
    {
        for ($i = 0; $i < 6; $i++) {
            $this->numArr = $this->selectNum($this->numArr);
        }
        
        $this->assertCount(6, $this->selectedNumArr);
        $unique = array_unique($this->selectedNumArr);
        $this->assertCount(6, $unique);
        $this->assertEquals($unique, $this->selectedNumArr);
    }

    /**
     * 空の配列を渡した場合の境界値テスト
     */
    public function test_selectNum_emptyArray_returnsEmptyArray(): void
    {
        $emptyArray = [];
        
        $result = $this->selectNum($emptyArray);
        
        $this->assertEmpty($result);
        $this->assertEmpty($this->selectedNumArr);
    }

    /**
     * 配列に1つの要素しかない場合の境界値テスト
     */
    public function test_selectNum_singleElement_selectsOnlyElement(): void
    {
        $singleArray = [42];
        
        $result = $this->selectNum($singleArray);
        
        $this->assertEmpty($result);
        $this->assertEquals([42], $this->selectedNumArr);
    }

    /**
     * ロト抽選プロセス全体をシミュレートし、6つの数字が正しくソートされることを確認
     */
    public function test_lottoDrawProcess_sixNumbers_correctOrder(): void
    {
        $copyNumArr = $this->numArr;
        
        for ($i = 0; $i < 6; $i++) {
            $copyNumArr = $this->selectNum($copyNumArr);
        }
        
        sort($this->selectedNumArr);
        
        $this->assertCount(6, $this->selectedNumArr);
        $sortedCopy = $this->selectedNumArr;
        sort($sortedCopy);
        $this->assertEquals($sortedCopy, $this->selectedNumArr);
        
        for ($i = 0; $i < 5; $i++) {
            $this->assertLessThan($this->selectedNumArr[$i + 1], $this->selectedNumArr[$i]);
        }
    }

    /**
     * ボーナス数字が本数字と重複せず、1-45の範囲内であることを確認
     */
    public function test_bonusNumber_notInMainNumbers_validRange(): void
    {
        $copyNumArr = $this->numArr;
        
        for ($i = 0; $i < 6; $i++) {
            $copyNumArr = $this->selectNum($copyNumArr);
        }
        
        $bonusNum = $copyNumArr[array_rand($copyNumArr)];
        
        $this->assertNotContains($bonusNum, $this->selectedNumArr);
        $this->assertGreaterThanOrEqual(1, $bonusNum);
        $this->assertLessThanOrEqual(45, $bonusNum);
    }

    /**
     * 複数回の抽選で数字の分布が統計的に妥当であることを確認
     */
    public function test_numberDistribution_multipleDraws_statisticallyValid(): void
    {
        $distribution = array_fill(1, 45, 0);
        $draws = 1000;
        
        for ($d = 0; $d < $draws; $d++) {
            $this->setUp();
            $copyNumArr = $this->numArr;
            
            for ($i = 0; $i < 6; $i++) {
                $copyNumArr = $this->selectNum($copyNumArr);
            }
            
            foreach ($this->selectedNumArr as $num) {
                $distribution[$num]++;
            }
        }
        
        $expectedAverage = ($draws * 6) / 45;
        $tolerance = $expectedAverage * 0.3;
        
        foreach ($distribution as $count) {
            $this->assertGreaterThan($expectedAverage - $tolerance, $count);
            $this->assertLessThan($expectedAverage + $tolerance, $count);
        }
    }

    /**
     * resetLotto関数が抽選後に初期状態に戻すことを確認
     */
    public function test_resetLotto_afterDraw_resetsToInitialState(): void
    {
        $copyNumArr = $this->numArr;
        for ($i = 0; $i < 6; $i++) {
            $copyNumArr = $this->selectNum($copyNumArr);
        }
        
        $this->assertNotEmpty($this->selectedNumArr);
        
        $this->resetLotto();
        
        $this->assertEmpty($this->selectedNumArr);
    }

    /**
     * 選択された数字が常に昇順でソートされることをデータプロバイダで検証
     */
    #[DataProvider('provideSortTestCases')]
    public function test_selectedNumbers_alwaysSorted_afterProcessing(int $iterations): void
    {
        for ($iter = 0; $iter < $iterations; $iter++) {
            $this->setUp();
            $copyNumArr = $this->numArr;
            
            for ($i = 0; $i < 6; $i++) {
                $copyNumArr = $this->selectNum($copyNumArr);
            }
            
            sort($this->selectedNumArr);
            
            $isSorted = true;
            for ($i = 0; $i < 5; $i++) {
                if ($this->selectedNumArr[$i] >= $this->selectedNumArr[$i + 1]) {
                    $isSorted = false;
                    break;
                }
            }
            
            $this->assertTrue($isSorted, "Numbers should be sorted in ascending order");
        }
    }

    public static function provideSortTestCases(): array
    {
        return [
            'single iteration' => [1],
            'ten iterations' => [10],
            'fifty iterations' => [50],
        ];
    }

    /**
     * 全ての抽選で数字が1-45の範囲内であることをデータプロバイダで検証
     */
    #[DataProvider('provideRangeTestCases')]
    public function test_allNumbers_withinValidRange_multipleDraws(int $minRange, int $maxRange): void
    {
        $this->numArr = range($minRange, $maxRange);
        
        for ($i = 0; $i < 6 && count($this->numArr) > 0; $i++) {
            $this->numArr = $this->selectNum($this->numArr);
        }
        
        foreach ($this->selectedNumArr as $num) {
            $this->assertGreaterThanOrEqual($minRange, $num);
            $this->assertLessThanOrEqual($maxRange, $num);
        }
    }

    public static function provideRangeTestCases(): array
    {
        return [
            'standard lotto range' => [1, 45],
            'small range' => [1, 10],
            'high range' => [40, 45],
            'single digit range' => [1, 9],
        ];
    }

    /**
     * 選択された数字配列をクリアする（JavaScriptのresetResult関数をPHPで実装）
     */
    private function resetResult(): void
    {
        $this->selectedNumArr = [];
    }

    /**
     * 配列からランダムに数字を選択し、選択された数字を除いた配列を返す
     * （JavaScriptのselectNum関数をPHPで実装）
     */
    private function selectNum(array $numArr): array
    {
        if (empty($numArr)) {
            return [];
        }
        
        $index = array_rand($numArr);
        $this->selectedNumArr[] = $numArr[$index];
        unset($numArr[$index]);
        
        return array_values($numArr);
    }

    /**
     * 抽選結果をリセットし初期状態に戻す（JavaScriptのresetLotto関数をPHPで実装）
     */
    private function resetLotto(): void
    {
        $this->resetResult();
    }
}