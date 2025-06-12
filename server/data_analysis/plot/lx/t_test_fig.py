import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from statannotations.Annotator import Annotator

def plot_box_with_significance(column_name, test, p_value, alternative, baseline_file_path, experiment_file_path):
    # 读取数据
    baseline_data = pd.read_csv(baseline_file_path)
    experiment_data = pd.read_csv(experiment_file_path)

    # 提取指定列数据
    baseline_values = baseline_data[column_name]
    experiment_values = experiment_data[column_name]

    # 创建数据框
    data = pd.DataFrame({'Group': ['Baseline'] * len(baseline_values) + ['FARPLS'] * len(experiment_values),
                         column_name: pd.concat([baseline_values, experiment_values])})

    # 绘制箱线图
    plt.figure(figsize=(5, 5))
    ax = sns.boxplot(data=data, x='Group', y=column_name,
                     palette={"Baseline": "#3FAA59", "FARPLS": "#FF7F00"}, width=0.6)
    
    # 使用 statannotations 库来标注显著性
    annotator = Annotator(ax, pairs=[("Baseline", "FARPLS")], data=data, x='Group', y=column_name, order=["Baseline", "FARPLS"])
    annotator.configure(test=test, text_format='star', loc='inside')
    
    # 格式化p值
    scientific_notation = "{:.2e}".format(p_value)
    
    # 根据显著性判断设置标注信息
    if p_value < 0.05:
        p_realm = "< 0.05"
        significance = "significantly"
    else:
        p_realm = "> 0.05"
        significance = "no significant differences"
    
    annotationWord = f"{test} p = {p_realm} {scientific_notation} {significance} {alternative}"
    annotator.set_custom_annotations([annotationWord])

    annotator.annotate()
    
    # 去除图的上边框和右边框
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    plt.gca().spines['top'].set_visible(False)
    plt.gca().spines['right'].set_visible(False)

    # 添加图例
    baseline_patch = plt.Rectangle((0, 0), 1, 1, color="#3FAA59", label='Baseline')
    farpls_patch = plt.Rectangle((0, 0), 1, 1, color="#FF7F00", label='FARPLS')
    plt.legend(handles=[baseline_patch, farpls_patch], loc='center right', bbox_to_anchor=(1.3, 0.5))

    # 保存图形为PDF文件
    plt.savefig(f'{column_name}_Boxplot.pdf', format='pdf', dpi=300, bbox_inches='tight')

    # 显示图形
    plt.show()

# 使用示例
baseline_file_path = '../time_analysis/baseline.csv'
experiment_file_path = '../time_analysis/experiment.csv'
plot_box_with_significance('Total Time', 't-test', 0.00173691885101174, '<', baseline_file_path, experiment_file_path)
