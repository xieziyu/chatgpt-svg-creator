import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CreatorService } from '../../services/creator.service';

@Component({
  selector: 'app-svg-creator',
  templateUrl: './svg-creator.component.html',
  styleUrls: ['./svg-creator.component.scss'],
})
export class SvgCreatorComponent implements OnInit, OnDestroy {
  userInput = '';
  sanitizedSvg: SafeHtml = '';

  submitting = false;

  keywords: string[] = [];
  reasoning = '';
  rawResp = '';

  @ViewChild('svgPreview', { static: true })
  svgPreview?: ElementRef<HTMLElement>;

  @ViewChild('advancedfileinput', { static: true })
  advancedFileInput?: ElementRef;

  private readonly accept = '.svg';
  private _svgCode = '';

  constructor(private sanitizer: DomSanitizer, private creator: CreatorService) {}

  get svgCode() {
    return this._svgCode;
  }

  set svgCode(value: string) {
    this._svgCode = value;
    this.sanitizedSvg = this.sanitizer.bypassSecurityTrustHtml(value);
    this.clearFile();
  }

  ngOnInit() {
    this.keywords = [];
    this.reasoning = '';
    this.creator.svgCode$.subscribe(rs => {
      if (rs.done) {
        this.rawResp = '';
        // SSE 结束后统一解析
        const rsp = this.creator.extractResult(rs.content);
        this.svgCode = rsp.SVG;
        this.keywords = rsp.Keywords;
        this.reasoning = rsp.Reasoning;
        console.log(rsp);
      } else {
        // 临时显示输出
        this.rawResp = rs.content;
      }
    });
  }

  ngOnDestroy() {
    this.creator.svgCode$.unsubscribe();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      this.submit();
    }
  }

  async submit() {
    if (this.submitting) {
      return;
    }
    this.submitting = true;
    let svgCodes = this.creator.extractSVGCode(this.userInput);
    if (svgCodes.length) {
      this.svgCode = svgCodes.join('\n');
    }
    const nonSVG = this.creator.extractNonSVGCode(this.userInput);
    // 仅在有其他内容的时候，调用 API
    if (nonSVG) {
      await this.creator.analyzeInputStreaming(this.userInput, this.svgCode);
    }
    this.submitting = false;
  }

  stop() {
    this.creator.stopAnalyze();
  }

  clear() {
    this.userInput = '';
    this.svgCode = '';
    this.sanitizedSvg = '';
    this.keywords = [];
    this.reasoning = '';
  }

  exportSVG() {
    const svg = this.svgPreview?.nativeElement.querySelector('svg');
    if (!svg) {
      return;
    }
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'image.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  chooseFile() {
    this.advancedFileInput?.nativeElement.click();
  }

  clearFile() {
    if (this.advancedFileInput?.nativeElement) {
      this.advancedFileInput.nativeElement.value = '';
    }
  }

  importSVG(event: any) {
    const files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
    if (!files.length) {
      return;
    }
    const file: File = files[0];
    if (this.isFileTypeValid(file)) {
      file.text().then(text => {
        this.svgCode = this.creator.extractSVGCode(text).join('\n');
      });
    }
  }

  private isFileTypeValid(file: File): boolean {
    let acceptableTypes = this.accept.split(',').map(type => type.trim());
    for (let type of acceptableTypes) {
      let acceptable = this.isWildcard(type)
        ? this.getTypeClass(file.type) === this.getTypeClass(type)
        : file.type == type || this.getFileExtension(file).toLowerCase() === type.toLowerCase();

      if (acceptable) {
        return true;
      }
    }
    return false;
  }

  getTypeClass(fileType: string): string {
    return fileType.substring(0, fileType.indexOf('/'));
  }

  isWildcard(fileType: string): boolean {
    return fileType.indexOf('*') !== -1;
  }

  getFileExtension(file: File): string {
    return '.' + file.name.split('.').pop();
  }
}
